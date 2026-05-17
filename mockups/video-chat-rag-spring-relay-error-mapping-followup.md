# Spring SSE 릴레이 — 에러 응답 매핑 후속 티켓

**기록일**: 2026-05-12
**상태**: 미해결 (1차 범위 밖, 별도 작업 예정)
**범위**: `VideoChatRagAPIController` (`/api/v1/video-chat/rag/stream`)

---

## 1. 현재 상태

E2E 수동 검증 결과:

| 시나리오 | 결과 |
| --- | --- |
| 인증 없음 | 401 (Spring 자체 차단, 의도대로) |
| 정상 호출 (`member_id=1`, `video_session_id=1`) | **200 + SSE 청크 정상 릴레이** (129 글자 청크, 답변 동일, `[BR]` 보존) |
| FastAPI 4xx 응답 (403/422 등) | **401 로 변형** — 의도와 다름 |

성공 경로는 완전히 동작. 실패 경로만 HTTP 상태코드가 `401 Unauthorized` 로 통일돼 클라이언트에서 원인 구분이 어려운 상태.

---

## 2. 원인

Spring MVC 가 `Flux<ServerSentEvent<String>>` 반환 타입을 처리하는 흐름:

```
[정상]
요청 → JWT 필터 → SecurityContext 설정 → 컨트롤러 → Flux 반환
     → 첫 청크 emit → 응답 200 commit → 청크 흐름 → 종료

[실패]
요청 → JWT 필터 → SecurityContext 설정 → 컨트롤러 → Flux 반환
     → onStatus 가 ResponseStatusException emit
     → Spring MVC 가 에러를 응답으로 변환하려고 async dispatch
     → 새 스레드에서 보안 필터 재실행
     → SessionCreationPolicy.STATELESS + JWT 라 새 스레드엔 SecurityContext 없음
     → AuthenticationEntryPoint(AuthenticationHandler) 가 401 반환
     → 원래 의도였던 403/422 가 401 로 덮임
```

핵심: **컨트롤러에서 던진 예외가 async dispatch 를 통해 응답 변환되는 도중에 인증 컨텍스트가 사라짐**.

근거 (Spring log, exec-thread 별 추적):
- `exec-N`: AuthenticationFilter → Token valid → SecurityContext saved → Authentication Success
- `exec-N+1`: AuthenticationHandler → Authentication Failed: Full authentication is required

---

## 3. 해결 옵션 (택일)

### A. SSE body 안에 에러 임베드

응답 HTTP 상태는 항상 200. 에러는 SSE payload 안에 임베드.

```java
.bodyToFlux(...)
.onErrorResume(WebClientResponseException.class, ex -> {
    String errPayload = String.format(
            "{\"error\":{\"status\":%d,\"message\":%s}}",
            ex.getStatusCode().value(),
            toJsonString(ex.getResponseBodyAsString())
    );
    return Flux.just(ServerSentEvent.<String>builder().data(errPayload).build());
});
```

- 변경 파일: `VideoChatRagAPIController.java` 1개
- 변경 라인: 약 +10 (헬퍼 포함)
- 반환 타입 유지: `Flux<ServerSentEvent<String>>`
- 프론트엔드 영향: SSE payload 마다 `error` 키 존재 분기 추가
- 트레이드오프: HTTP 상태가 항상 200 (REST 관습과 다름, 그러나 SSE 도메인에선 표준 패턴)

### B. SseEmitter + 헤더 단계 분기

응답 HTTP 상태를 4xx/5xx 그대로 유지.

```java
ClientResponse first = ragWebClient.post()...exchangeToMono(r -> Mono.just(r)).block();
if (first.statusCode().isError()) {
    String body = first.bodyToMono(String.class).blockOptional().orElse("");
    return ResponseEntity.status(first.statusCode()).body(body);
}
SseEmitter emitter = new SseEmitter(60_000L);
first.bodyToFlux(...).subscribe(
        e -> emitter.send(e),
        emitter::completeWithError,
        emitter::complete
);
return ResponseEntity.ok(emitter);
```

- 변경 파일: `VideoChatRagAPIController.java` 1개
- 변경 라인: 약 +20
- 반환 타입 변경: `Flux<...>` → `ResponseEntity<?>`
- 프론트엔드 영향: 표준 fetch 에러 처리 (`res.ok` 체크 등)
- 트레이드오프: 첫 바이트까지 짧은 `block()` 호출 (수 ms)

### C. 기타 (비추)

- `spring.security.filter.dispatcher-types: REQUEST,ERROR` — 글로벌 영향. 다른 비동기 엔드포인트의 보안 재검사를 함께 끄게 됨.

---

## 4. 권장

- **단기 (1차 릴리스)**: 에러 처리 없이 진행. 클라이언트는 401 도 일단 "오류 발생" 으로 처리. 정상 경로는 완벽 동작이므로 데모/베타 영향 없음.
- **후속 (정식)**: **A 패턴** 권장. 변경 영향 가장 작고 SSE 도메인 표준 패턴. 프론트엔드 계약 한 줄만 추가하면 됨.

---

## 5. 참조

- 현재 코드: `globalgates/src/main/java/com/app/globalgates/controller/video_chat/VideoChatRagAPIController.java`
- FastAPI 측: 에러 매핑은 이미 의도대로 (401/403/422 명확). Spring 단계에서만 변형 발생.
- 관련 Spring 이슈: `OncePerRequestFilter` + `STATELESS` session + reactive Flux 의 async dispatch 시 SecurityContext 누락.
