# Video Chat RAG — FastAPI 측 계획안 (v3, 2026-05-12)

> 이 문서는 `/Users/yoonchan/Desktop/gb/ai/llm/f_video_chat_rag.ipynb` 노트북을
> `~/Desktop/gb/fastapi/workspace/` 의 기존 패턴(`basic/`, `stream/`)에 맞추어
> 옮기기 위한 **FastAPI 측 전용 계획안**이다.
> Spring Boot(`globalgates`) 연동 명세와 통합 시퀀스는 동일 디렉터리의
> `video-chat-rag-fastapi-spring-plan.html`(Codex 작성본)을 참고한다.
>
> v3 변경점 — **`stream/` 폴더 패턴으로 SSE 단순화** (사용자 결정, 2026-05-12):
> - **§5 D4 뒤집힘 (재차)**: `chain.ainvoke` + char yield → **`chain.astream` 자체 청크 + payload `{"text": ...}` 단일 키**.
>   캐시 hit / 기본 답변일 때만 char 단위 sleep 유지.
> - **§5 D5 뒤집힘**: 원문 그대로 → **`\n` → `[BR]` 치환** (`stream/cache.py` 패턴).
> - **§6 재작성**: `thinking_start/meta/thinking_end/token/done/error` 5단계 제거 → **payload `{"text": ...}` 단일 형식**.
> - **§7 실패 모드**: `error` 이벤트 → **`[ERROR] ...` 텍스트 청크 1개로 흘려보냄**.
> - **§8 F4**: char yield + indicator 단독 검증 → **stream 패턴(astream + [BR] + 단일 payload) 단독 검증**.
> - **§3 매핑**: `ask_video_chat_rag` 의 dict 반환은 SSE 단일 `text` payload 로 변환.
> - 부록 A 에 v2 → v3 차분 추가.
>
> v2(2026-05-11) → v3 의 의미: 노트북 + KakaoTalk 효과 강조 단계 신호 시퀀스는 **버려졌고**, 워크스페이스 `stream/` 패턴이 표준이 됐다.

---

## 0. 사전 확인 (재확인 불필요한 사실)

| 항목 | 확인된 사실 | 출처 |
| --- | --- | --- |
| 노트북 흐름 | DB SELECT → TextLoader → `RecursiveCharacterTextSplitter` → `HuggingFaceEmbeddings(jhgan/ko-sbert-nli)` → `FAISS` → LCEL chain → Redis answer cache | `f_video_chat_rag.ipynb` 본문 |
| 캐시 scope | `member_{id}__video_session_{id|all}`, Redis Tag로 격리 | 같은 노트북, `step2-cache` |
| 권한 검증 | `tbl_video_session.caller_id`/`receiver_id` 일치 여부를 **cache lookup 이전에** 검증 | 같은 노트북, `assert_video_session_access` |
| 워크스페이스 기존 패턴 | `basic/` = `router/service/repository/domain` + `asyncpg` Pool + lifespan | `workspace/basic/main.py`, `database.py` |
| 스트리밍 표준 패턴 | `StreamingResponse(media_type="text/event-stream")` + `data: {json}\n\n`, payload 는 `{"text": "..."}`, `\n`→`[BR]`, **`llm.stream`/`chain.astream` 자체 청크** | `workspace/stream/main.py`, `cache.py` |
| 운영 스키마 (검증으로 드러난 사실) | `tbl_ai_video_summary.video_session_id` UNIQUE (1:1), `conversation_id` 컬럼은 `tbl_video_session` 에만 존재, `caller_id/receiver_id/conversation_id` 모두 NOT NULL FK | F5 검증 단계, 운영 `globalgates` DB |
| 기존 통합 기획안 | Spring SSE relay, internal token, `/internal/ai/video-chat/rag/stream` 정의 | `video-chat-rag-fastapi-spring-plan.html` §3–5 |

---

## 1. 비슷한 파일 구조의 공식 레퍼런스 (출처 분명)

| 영역 | 1차 출처 | 우리 코드의 대응 |
| --- | --- | --- |
| FastAPI 패키지 분리 (`Bigger Applications`) | `https://fastapi.tiangolo.com/tutorial/bigger-applications/` | `router/*.py` 분리, `app.include_router(...)` |
| FastAPI lifespan으로 외부 자원 초기화 | `https://fastapi.tiangolo.com/advanced/events/` | `main.py` `lifespan`에서 DB 풀 + 임베딩 모델 워밍 + RAG 서비스 wiring |
| FastAPI `StreamingResponse` | `https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse` | `/internal/ai/video-chat/rag/stream` |
| asyncpg 커넥션 풀 | `https://magicstack.github.io/asyncpg/current/usage.html` | `core/database.py`의 `create_pool` + `acquire` |
| LangChain RAG 튜토리얼 (indexing/retrieval 분리) | `https://python.langchain.com/docs/tutorials/rag/` | `_build_member_vectorstore` ↔ `stream_answer` |
| LangChain FAISS (metadata filter) | `https://python.langchain.com/docs/integrations/vectorstores/faiss/` | `FAISS.from_documents`, `similarity_search(..., filter=...)` |
| LangChain LCEL 스트리밍 | `https://python.langchain.com/docs/concepts/lcel/` , `https://python.langchain.com/docs/how_to/streaming/` | **`chain.astream({...})`** — 청크를 async generator 로 받음 |
| OWASP API1:2023 BOLA | `https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/` | `member_can_access_video_session` 사전 호출 의무화 |
| Tiangolo `full-stack-fastapi-template` 디렉터리 구조 | `https://github.com/fastapi/full-stack-fastapi-template` | `router/service/repository/domain/core` 명명 근거 |

**의도적으로 인용하지 않은 출처**

- `langchain-community`의 `Redis` VectorStore + `RedisTag` 정확한 시그니처 안정성 — 버전 변동 영역.
- LightRAG `aquery(question, mode="hybrid")` — **§5 D8 에서 1차 채택 안 함으로 확정**. 코드 어디에도 들어가지 않는다.
- 인터넷 블로그 "FastAPI + LangChain RAG" 예시 — 1차 출처 아님.

---

## 2. 권장 디렉터리 (실제 적용 — `ai_contents/` 베이스)

```
workspace/ai_contents/
  main.py                          # FastAPI app, CORS, lifespan
  core/
    config.py                      # env, internal token, redis url, char_delay
    database.py                    # asyncpg Pool
    embeddings.py                  # HuggingFaceEmbeddings lazy singleton + warmup
  domain/
    video_chat_rag.py              # Pydantic DTO (RagStreamRequest, VideoSummaryRow)
  repository/
    video_summary_repository.py    # SELECT / BOLA SELECT
    product_repository.py          # (기존)
  service/
    video_rag_semantic_cache.py    # Redis answer cache, scope tag
    video_rag_service.py           # FAISS + LCEL + stream_answer (stream 패턴)
    profanity_service.py           # (기존)
  router/
    video_chat_rag.py              # /internal/ai/video-chat/rag/stream
    profanity.py                   # (기존)
  tests/
    conftest.py                    # transaction-rollback DB, test_actors, cache_index
    test_video_rag_repository.py
    test_video_rag_semantic_cache.py
    test_video_rag_stream_events.py
    test_main.py                   # (기존)
    test_no_llm_dependency.py      # (기존, main.py 검사 대상 제외로 갱신)
  requirements.txt
  test_main.http
  pytest.ini
```

근거: `router/service/repository/domain` 4-layer + `core/`. 기존 `ai_contents/` 의 profanity 모듈을 보존하며 공존.

---

## 3. 노트북 코드의 모듈 매핑 (v3)

| 노트북 셀 | 옮길 위치 | 비고 |
| --- | --- | --- |
| `load-env`, REDIS_URL/임계값 | `core/config.py` | `os.getenv` 그대로 + 타입 변환 |
| `step1-db` SELECT, `assert_video_session_access` | `repository/video_summary_repository.py` | SQLAlchemy → `asyncpg`. **노트북 SQL 의 `s.conversation_id` 는 잘못된 컬럼** → `vs.conversation_id` (검증으로 확정) |
| `step1-textloader` (txt 저장) | **제거** | 운영에서는 `Document` 를 SELECT 결과에서 직접 생성 |
| `step2-cache` 캐시 함수 일체 | `service/video_rag_semantic_cache.py` | `HuggingFaceEmbeddings` 공유 싱글톤 사용 |
| `step3-split`~`step5-vectorstore` | `service/video_rag_service.py::_build_member_vectorstore` | chunk_size=500, overlap=50 유지 |
| `step6-retriever`~`step9-chain` | `service/video_rag_service.py` | `chain = prompt | llm | StrOutputParser()` 1회 조립 |
| `ask_video_chat_rag` | `stream_answer` async generator | **dict 반환 → SSE `data: {"text": "..."}\n\n` 단일 청크**. 단계 신호 없음 |
| 검증 셀(verify1~verify-multi) | `test_main.http` + pytest 19건 | 자동화 + 수동 |

---

## 4. 자원 수명(Lifecycle)

| 자원 | 생성 시점 | 근거 |
| --- | --- | --- |
| `asyncpg.Pool` | `lifespan` startup | `basic/database.py` 패턴 |
| `HuggingFaceEmbeddings(jhgan/ko-sbert-nli)` (RAG·캐시 공용) | lifespan `warmup_embeddings()` | 로드 비용 큼, 1 인스턴스 공유. `core/embeddings.py::get_shared_embeddings` lazy singleton |
| `ChatOpenAI(cache=False)` | lifespan에서 1회 생성 후 `app.state.video_rag_service` 에 주입 | `set_llm_cache(None)` 효과를 `cache=False` 로 대체 |
| FAISS vectorstore | **요청마다 회원 범위로 새로 생성** | 회원/세션 격리. 회의 수 증가 시 §5 D1 재검토 |

**모르는 부분**: `jhgan/ko-sbert-nli` CPU throughput, 회원당 회의 P95/P99 — 1차 배포 후 측정.

---

## 5. 결정해야 하는 설계 항목 (v3 갱신)

| # | 항목 | 옵션 | 결정 |
| --- | --- | --- | --- |
| D1 | FAISS 인덱스 캐싱 | (a) 요청마다 / (b) member LRU / (c) 디스크 persist | **(a)로 시작**. 회의 수 증가 시 (b) |
| D2 | DB 드라이버 | (a) `asyncpg` / (b) SQLAlchemy+pandas(노트북) | **(a)** — 워크스페이스 통일 |
| D3 | 인증 경계 | (a) Spring이 internal token + memberId 주입 / (b) FastAPI에서도 JWT / (c) mTLS | **(a)** — 사설망만 노출 |
| D4 | **SSE 스트리밍 방식** | (a) `chain.astream` LLM 청크 자체 / (b) `chain.ainvoke` 후 char 단위 sleep | **(a) — 2026-05-12 확정**. `stream/cache.py` 패턴. 캐시 hit/기본 답변은 char sleep (자연 페이스 없음). §6 참조 |
| D5 | 줄바꿈 처리 | `\n → [BR]` 치환 vs 원문 그대로 | **`[BR]` 치환 — 2026-05-12 확정**. SSE 라인 구분자 `\n\n` 와의 충돌 방지 + 프론트가 `[BR]` 을 `<br>` 로 변환 |
| ~~D6~~ | ~~`tbl_ai_video_chat_query_log` 스키마~~ | **항목 폐기 (2026-05-12)** | 운영 로그/관측은 1차 범위 밖. `QueryLogRecord`·`insert_query_log` 코드에서 제거. 추후 필요 시 별도 티켓 |
| D7 | 요약 INSERT 트리거 | 본 1차 보류 | Q&A 안정화 후 |
| D8 | RAG 엔진 | (a) LangChain (노트북 그대로) / (b) LightRAG `aquery(mode="hybrid")` | **(a) 확정 — 1차에서 LightRAG 미사용**. `rag.aquery` 코드는 어디에도 들어가지 않음 |
| D9 | 답변 최대 길이 제한 | (a) 프롬프트에 "X자 이내로" / (b) 답변 자르기 / (c) 제한 없음 | **(c) 1차 — 무제한**. astream 의 자연 페이스라 char sleep 누적 부담 없음 |

---

## 6. 스트리밍 출력 방식 — `stream/` 패턴 (v3 재작성)

### 6.1 패턴 선택의 근거

워크스페이스에 이미 존재하는 `stream/cache.py` 가 정식 표준이다. 이 표준의 핵심:

```python
# LLM 청크를 자체 페이스로 흘려보냄 (인위 sleep 없음)
for chunk in llm.stream(message):
    display = chunk.content.replace("\n", "[BR]")
    yield f"data: {json.dumps({'text': display}, ensure_ascii=False)}\n\n"

# 캐시 hit 때만 글자 단위 sleep
for char in cached_content:
    time.sleep(0.005)
    yield f"data: {json.dumps({'text': char.replace(chr(10), '[BR]')}, ensure_ascii=False)}\n\n"
```

v2 의 5단계 시퀀스(`thinking_start/meta/thinking_end/token/done/error`)는 이 표준과 어긋난다. 일관성 위해 **단계 신호를 제거**하고 단일 payload 로 통일.

### 6.2 SSE 청크 1종 (확정)

router 의 `StreamingResponse` 가 송출하는 라인은 단 1종:

```
data: {"text": "..."}\n\n
```

- `text` 값은 **글자 1개 또는 LLM 청크 1개**.
- 원문의 `\n` 은 송출 전에 **`[BR]` 로 치환**한다 (SSE 라인 구분자와 충돌 방지).
- generator 종료 = 응답 종료 신호 (별도 `done` 이벤트 없음).
- 에러는 마지막 청크 1개로 `[ERROR] <message>` 텍스트 송출 후 generator 종료.

### 6.3 `stream_answer` 동작 흐름

> 본 문서는 계획안이므로 책임 분할만 명시. 실제 구현은 `service/video_rag_service.py` 참조.

1. router: `member_can_access_video_session(member_id, video_session_id)` 호출. 실패 시 `403` (스트림 시작 전).
2. router: `StreamingResponse(stream_answer(...), media_type="text/event-stream")` 반환.
3. service `stream_answer`:
   1. `cache.lookup(...)` 시도. **hit 이면** 저장된 answer 문자열을 **글자 단위 + `char_delay_sec` sleep** 으로 흘려보내고 `return`. 저장 호출 없음.
   2. **miss 이면** `repo.find_summaries_for_member(...)` 로 회원 요약 조회.
      - 0건이면 `EMPTY_SUMMARIES_ANSWER` ("확인 가능한 화상채팅 요약이 없습니다.") 를 글자 단위 sleep 으로 흘려보냄. 캐시 store 후 `return`.
      - 1건 이상이면 `_build_member_vectorstore` → `_retrieve_context` → **`chain.astream({context, question})`** 호출.
   3. `astream` 의 매 청크를 누적(`full_content += chunk`) 하면서 그대로 `_sse_text(chunk)` 로 SSE 송출. 인위 sleep 없음 (LLM 자체 페이스).
   4. astream 종료 후, `full_content` 비어있지 않으면 `cache.store(...)`.
4. 어느 단계든 예외: `[ERROR] <message>` 텍스트 청크 1개 송출 후 generator 종료. 캐시 store 금지.

### 6.4 typing indicator UX 의 위치 변경

v2 는 FastAPI 가 `thinking_start/thinking_end` 신호로 typing indicator 시작/종료를 알렸다.
**v3 에서는 FastAPI 가 그런 신호를 보내지 않는다.** 프론트(Spring 화면 위젯 `video_ai/event.js`)는 다음 시점으로 알아서 indicator 를 제어한다:

- indicator 시작: 사용자가 요청 전송 시점 (Spring `WebClient.exchange` 직전 = 화면에서 send 버튼 누른 순간).
- indicator 종료: SSE 의 **첫 번째 `text` 청크 수신 시점**.

근거: stream 패턴에는 단계 신호가 없으므로 "응답 시작" 신호도 첫 청크 도착이다. FastAPI 가 LLM 응답 대기 중에는 SSE 가 흘러나오지 않으므로, 첫 청크 도착이 곧 "답변 시작" 이다.

> **출처 주의**: KakaoTalk/iMessage typing indicator 동작은 일반 통용 UX 패턴이지 공식 사양이 아니다. 모션 디테일은 디자이너/프론트 판단.

### 6.5 stream 패턴의 트레이드오프

- **장점**:
  - 표준 라이브러리 함수 1개만 호출 (`chain.astream`) — 코드 단순.
  - TTFT(Time To First Token) 가 LLM 자체 페이스 만큼 빠름. char sleep 없음.
  - SSE payload 가 1종이라 프론트도 단순.
- **단점**:
  - LLM 청크 페이스가 균일하지 않음 — OpenAI 측 토큰화 / 네트워크 영향으로 청크 크기 불규칙.
  - 캐시 hit 시에는 1회에 전체 답이 있어 인위 sleep 으로 페이스를 만들어야 함 → hit/miss 의 UX 가 약간 다름.
  - 단계 신호가 없어서 디버그/통계용 cacheHit/score 노출 불가 (필요 시 응답 헤더로 빼는 별 메커니즘 필요).
- `char_delay_sec` = 0.03s 는 `STREAM_CHAR_DELAY_SEC` env 로 조정. 캐시 hit / 기본 답변에만 적용.

---

## 7. 실패 모드 & 안전장치 (v3 갱신)

| 시나리오 | 동작 |
| --- | --- |
| Redis 다운 | `cache.lookup` except → None 반환 → RAG 경로. `cache.store` 실패도 except + 로그 |
| `member_id` 누락 | Pydantic 422 |
| `video_session_id` 타인 소유 | **`StreamingResponse` 생성 전** 403 — SSE 청크 하나도 송출 안 함 |
| 회원 요약 0건 | `EMPTY_SUMMARIES_ANSWER` 를 글자 단위 sleep 으로 송출 + 캐시 store |
| OpenAI 호출 실패 | `[ERROR] <message>` 텍스트 청크 1개 송출 후 generator 종료. 캐시 store 금지 |
| **스트림 도중 클라이언트 disconnect** | FastAPI 측 generator 는 `asyncio.CancelledError` — `cache.store` 가 astream 완료 후에만 실행되므로 부분 응답으로는 캐싱되지 않음 |
| 동시 동일 질문 | 미해결. cache double-write 가능하나 결과 동일하므로 무해 |

---

## 8. 적용 순서 (작은 검증 단위, v3)

1. **F1 인프라**: `core/config.py`(env 9종 + `STREAM_CHAR_DELAY_SEC`), `core/database.py`, `core/embeddings.py` + lifespan 워밍. 헬스체크로 검증.
2. **F2 권한 + repository**: `member_can_access_video_session`, `find_summaries_for_member` (운영 스키마 컬럼명 `vs.conversation_id` 반영). pytest 6건.
3. **F3 semantic cache**: `service/video_rag_semantic_cache.py`. 임계 0.3, scope tag 격리. pytest 7건.
4. **F4 RAG 서비스 (stream 패턴)**: `_build_member_vectorstore`, `_retrieve_context`, `_astream_chain`, `_stream_text_chars`, `stream_answer`. **단계 신호 없이 `{"text": ...}` 단일 payload + `[BR]` 치환** 단독 검증. pytest 6건.
5. **F5 라우터**: `router/video_chat_rag.py` + internal token + 422/403/503 매핑.
6. ~~**F6 관측**~~ — **항목 폐기 (2026-05-12)**. 쿼리 로그/관측은 1차 범위 밖.
7. **F7 (후속) 요약 INSERT**: `summary_index_service` — 별도 티켓.

각 단계 검증 통과 후에만 다음 단계.

### 8.1 실제 적용 결과 (2026-05-12 직접 검증)

| 단계 | 자동 테스트 | 비고 |
| --- | --- | --- |
| F2 repository | 6/6 ✅ | 운영 globalgates DB, transaction-rollback |
| F3 semantic cache | 7/7 ✅ | 운영 Redis (`localhost:6380`), 임시 인덱스 |
| F4 RAG 서비스 (stream 패턴) | 6/6 ✅ | astream/[BR]/`{"text":...}` 검증 포함 |
| F5 라우터 | 수동 (`test_main.http`) | OpenAI 실호출 비용으로 자동화 안 함 |
| 기존 회귀 | profanity 3/3 ✅ | `test_no_llm_dependency.py` 의 검사 대상에서 `main.py` 제외 |

---

## 9. 의존성 후보

- `fastapi`, `uvicorn[standard]`
- `asyncpg`, `python-dotenv`
- `langchain`, `langchain-community`, `langchain-openai`, `langchain-huggingface`, `langchain-text-splitters`
- `faiss-cpu`
- `redis` (Python client), `sentence-transformers`
- `pydantic`
- `pytest`, `pytest-asyncio` (테스트)

버전 핀은 `basic/requirements.txt` 와 노트북 `requirements.txt` 교집합으로 별도 작업.

---

## 10. LightRAG 옵션 (D8 (b)) — 1차 미채택

사용자 결정(2026-05-12): **본 1차에는 LightRAG 를 사용하지 않는다.** `rag.aquery(question, mode="hybrid")` 형태의 호출은 코드 어디에도 들어가지 않는다.

후속 리팩토링에서 채택할 경우 변경 범위:
- `stream_answer` 내부 `_astream_chain(...)` 을 `await rag.aquery(...)` 로 교체.
- LightRAG 가 자체 스트리밍을 제공하지 않으면 캐시 hit 패턴(글자 단위 sleep)을 차용.
- payload 형식(`{"text": "..."}` 단일)과 `[BR]` 치환은 **유지**.

**모름**: 우리가 설치할 LightRAG 버전의 `aquery` 시그니처가 `mode="hybrid"` 키워드 직접인지 `param=QueryParam(mode="hybrid")` 인지. 설치 후 docstring 검증 필요.

---

## 11. 출처 (2026-05-12 시점 1차 자료)

- FastAPI Bigger Applications — `https://fastapi.tiangolo.com/tutorial/bigger-applications/`
- FastAPI Lifespan Events — `https://fastapi.tiangolo.com/advanced/events/`
- FastAPI StreamingResponse — `https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse`
- LangChain RAG 튜토리얼 — `https://python.langchain.com/docs/tutorials/rag/`
- LangChain FAISS — `https://python.langchain.com/docs/integrations/vectorstores/faiss/`
- LangChain LCEL — `https://python.langchain.com/docs/concepts/lcel/`
- LangChain Streaming How-to — `https://python.langchain.com/docs/how_to/streaming/`
- asyncpg Connection Pools — `https://magicstack.github.io/asyncpg/current/usage.html`
- Tiangolo full-stack-fastapi-template — `https://github.com/fastapi/full-stack-fastapi-template`
- OWASP API1:2023 BOLA — `https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/`

**인용하지 않은 것(이유)**
- KakaoTalk/iMessage typing indicator 공식 사양 — 존재하지 않는 영역.
- LightRAG `aquery` 정확한 키워드 시그니처 — 1차 미채택.
- `langchain-community` Redis VectorStore + `RedisTag` 임포트 안정성 — 버전 변동 영역.
- "FastAPI + LangChain RAG" 블로그 — 1차 출처 아님.

---

## 12. 명시적으로 모르는 부분

- 운영 회원당 회의 P95/P99 → D1 결정 보강 자료 없음.
- 요약 평균/최대 길이 → chunk_size 적정성 미확정.
- Spring↔FastAPI 네트워크 경로(같은 호스트/도커/별 호스트) → D3 보호 강도 미확정.
- typing indicator 의 정확한 모션 스펙(점 개수/주기/색) → 프론트/디자이너 결정.
- LightRAG 채택 시점/버전 → D8 (1차 미채택).

---

## 부록 A. 차분 요약

### v1 → v2 (2026-05-11)
- D4 결정: 토큰 streaming → 답변 전체 받은 뒤 char 단위 0.03s yield.
- §6 신설: typing indicator 시퀀스(`thinking_start`/`thinking_end`)와 SSE 이벤트 표준화 (5단계).
- D9 신설: 답변 길이 제한 검토.

### v2 → v3 (2026-05-12) — `stream/` 패턴으로 정렬
- **D6/F6 폐기**: 운영 쿼리 로그(`tbl_ai_video_chat_query_log`) 1차 범위에서 제거. `QueryLogRecord`/`insert_query_log` 코드·테스트·계획에서 모두 삭제. 추후 필요 시 별도 티켓.
- **D4 다시 뒤집힘**: char 단위 yield → `chain.astream` 자체 청크. 캐시 hit / 기본 답변에만 char sleep 유지.
- **D5 뒤집힘**: 원문 그대로 → `\n` → `[BR]` 치환.
- **D9 결정**: 답변 길이 제한 (c) 무제한 — astream 자연 페이스라 char sleep 누적 부담 없음.
- **§6 재작성**: 5단계 신호(`thinking_start/meta/thinking_end/token/done/error`) 제거 → SSE payload `{"text": ...}` 단일 종류. 에러는 `[ERROR] ...` 텍스트 청크 1개.
- **§6.4 typing indicator 책임 이전**: FastAPI 단계 신호 → 프론트가 SSE 첫 청크 수신 시점으로 자체 제어.
- **§7 실패 모드**: `error` SSE 이벤트 → `[ERROR] ...` 텍스트 청크.
- **§8 F4**: char yield + indicator 시퀀스 단독 검증 → stream 패턴(astream + [BR] + 단일 payload) 단독 검증.
- **§8.1 신설**: 2026-05-12 직접 검증 결과 — RAG 19/19, profanity 3/3.
- **§0 운영 스키마 한 줄 추가**: `tbl_ai_video_summary.video_session_id` UNIQUE / `conversation_id` 는 `tbl_video_session` 에만.
- **§2 디렉터리 갱신**: `workspace/video_chat_rag/` → `workspace/ai_contents/` (실제 적용 위치).
- **§3 매핑**: 노트북 `s.conversation_id` 오류 → `vs.conversation_id` 정정.
- **D8 확정**: LightRAG 1차 미채택. `rag.aquery` 코드 어디에도 안 들어감.
