package com.app.globalgates.controller.video_chat;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.video_chat.VideoChatRagAllStreamRequestDTO;
import com.app.globalgates.dto.video_chat.VideoChatRagHistoryTurnDTO;
import com.app.globalgates.dto.video_chat.VideoChatRagStreamRequestDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

// 영상통화 RAG SSE 릴레이 — Spring 인증을 통과한 회원만 FastAPI 로 토큰화된 요청을 흘려보냄
@RestController
@RequestMapping("/api/v1/video-chat/rag")
@RequiredArgsConstructor
@Slf4j
public class VideoChatRagAPIController {

    private final WebClient ragWebClient;

    // FastAPI 와 공유하는 HMAC 키 — WebClient default header 의 static token 과 동일 값 재사용
    @Value("${internal-ai.token}")
    private String internalSecret;

    // POST /api/v1/video-chat/rag/stream/session — 특정 회의 1건에 한정한 RAG SSE 릴레이.
    // 요약 카드 하단 "AI에게 물어보기" 챗봇이 사용. videoSessionId 필수 (DTO @NotNull).
    @PostMapping(value = "/stream/session", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamSession(
            @Valid @RequestBody VideoChatRagStreamRequestDTO req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long memberId = userDetails.getId();
        long ts = System.currentTimeMillis();
        String signature = signInternal(memberId, ts);

        // body 에는 member_id 를 싣지 않는다 — 헤더에 HMAC 으로 묶인 member_id 가 진실 소스
        Map<String, Object> body = new HashMap<>();
        body.put("question", req.getQuestion());
        body.put("video_session_id", req.getVideoSessionId());
        body.put("history", serializeHistory(req.getHistory()));

        return relayStream(body, "/internal/ai/video-chat/rag/stream/session", memberId, ts, signature);
    }

    // POST /api/v1/video-chat/rag/stream/all — 회원 전체 회의 요약을 컨텍스트로 한 통합 RAG SSE.
    // 별도 "전체 회의 RAG 챗봇" UI 가 사용. videoSessionId 자체를 받지 않는다.
    @PostMapping(value = "/stream/all", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamAll(
            @Valid @RequestBody VideoChatRagAllStreamRequestDTO req,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long memberId = userDetails.getId();
        long ts = System.currentTimeMillis();
        String signature = signInternal(memberId, ts);

        Map<String, Object> body = new HashMap<>();
        body.put("question", req.getQuestion());
        body.put("history", serializeHistory(req.getHistory()));

        return relayStream(body, "/internal/ai/video-chat/rag/stream/all", memberId, ts, signature);
    }

    // FastAPI 로 body 를 그대로 전달하고 SSE Flux 를 받아 다시 흘려보냄 — 두 엔드포인트 공통 경로.
    private Flux<ServerSentEvent<String>> relayStream(
            Map<String, Object> body, String uri, Long memberId, long ts, String signature) {
        return ragWebClient.post()
                .uri(uri)
                .header("X-Internal-Member", String.valueOf(memberId))
                .header("X-Internal-Ts", String.valueOf(ts))
                .header("X-Internal-Sig", signature)
                .bodyValue(body)
                .retrieve()
                // FastAPI 가 401/403/422/5xx 를 내면 그대로 상태코드 전파 (스트리밍 시작 전 단계)
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .defaultIfEmpty("")
                                .flatMap(errBody -> Mono.error(
                                        new ResponseStatusException(response.statusCode(), errBody)
                                ))
                )
                .bodyToFlux(new ParameterizedTypeReference<ServerSentEvent<String>>() {
                });
    }

    // history 를 FastAPI 가 그대로 받을 수 있는 [{role, content}, ...] 형태로 변환.
    // null/빈 입력은 빈 배열로 정규화.
    private List<Map<String, String>> serializeHistory(List<VideoChatRagHistoryTurnDTO> history) {
        List<Map<String, String>> out = new ArrayList<>();
        if (history == null) {
            return out;
        }
        for (VideoChatRagHistoryTurnDTO turn : history) {
            Map<String, String> m = new HashMap<>();
            m.put("role", turn.getRole().getWire());
            m.put("content", turn.getContent());
            out.add(m);
        }
        return out;
    }

    // member_id . ts 메시지를 internalSecret 로 HMAC-SHA256 서명 — FastAPI 가 같은 키로 검증
    private String signInternal(Long memberId, long ts) {
        String message = memberId + "." + ts;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    internalSecret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            ));
            return HexFormat.of().formatHex(
                    mac.doFinal(message.getBytes(StandardCharsets.UTF_8))
            );
        } catch (GeneralSecurityException e) {
            // HmacSHA256 미지원/키 invalid — 사실상 빌드 환경 문제 (런타임 부팅 이슈)
            throw new IllegalStateException("internal HMAC unavailable", e);
        }
    }
}
