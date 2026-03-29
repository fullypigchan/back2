window.onload = () => {
    // LiveKit 설정들
    const APPLICATION_SERVER_URL = "https://localhost:6080/";
    const LIVEKIT_URL = "wss://test-7paroumk.livekit.cloud";
    const MAIN_SERVER_URL = "";

    let room = null;
    let sessionId = null;
    const LivekitClient = window.LivekitClient;

// -------------------------------------------------------
// 화상통화 시작
// -------------------------------------------------------

    // 화상통화 시작
    async function startVideoCall() {
        // body data-* 속성에서 값 추출 (chat.js와 동일한 방식)
        const callerId   = Number(document.body.dataset.memberId || 0);
        const receiverId = Number(document.body.dataset.partnerId || 0);

        if (!callerId || !receiverId) {
            console.error("통화 상대방 정보가 없습니다.");
            return;
        }

        try {
            // 1단계: 우리 서버에 세션 생성 요청 (DB 저장)
            const { sessionId: sid, roomName } = await createVideoSession(receiverId);
            sessionId = sid;

            // 2단계: LiveKit 분리 서버에 토큰 요청
            const token = await requestLiveKitToken(roomName, `member-${callerId}`);

            // 3단계: 화상통화 UI 표시
            openVideoModal();

            // 4단계: LiveKit 서버에 WebSocket 연결
            await joinVideoRoom(token, roomName);

        } catch (error) {
            console.error("화상통화 시작 실패:", error.message);
            closeVideoModal();
        }
    }

    // 서버에 화상채팅방 정보 등록
    async function createVideoSession(receiverId) {
        const response = await fetch(MAIN_SERVER_URL + "/api/video-chat/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ receiverId })
        });

        if (!response.ok) throw new Error("세션 생성 실패: " + response.status);

        return await response.json(); // { sessionId, roomName }
    }

    // LiveKet 서버에 token 요청
    async function requestLiveKitToken(roomName, participantName) {
        const response = await fetch(LIVEKIT_SERVER_URL + "/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomName, participantName })
        });

        if (!response.ok) throw new Error("토큰 발급 실패: " + response.status);

        const data = await response.json();
        return data.token;
    }

// -------------------------------------------------------
// LiveKit Room 연결
// -------------------------------------------------------

    // 화상채팅방 입장
    async function joinVideoRoom(token, roomName) {
        room = new LivekitClient.Room();

        // 상대방 트랙 수신 시 화면에 렌더링
        room.on(LivekitClient.RoomEvent.TrackSubscribed, (track, _publication, participant) => {
            addVideoTrack(track, participant.identity);
        });

        // 상대방 트랙 제거 시 화면에서 제거
        room.on(LivekitClient.RoomEvent.TrackUnsubscribed, (track, _publication, participant) => {
            track.detach();
            document.getElementById(track.sid)?.remove();
            if (track.kind === "video") removeVideoContainer(participant.identity);
        });

        // 상대방 퇴장 시 통화 종료
        room.on(LivekitClient.RoomEvent.ParticipantDisconnected, () => {
            endVideoCall();
        });

        await room.connect(LIVEKIT_URL, token);

        // 카메라/마이크 활성화
        await room.localParticipant.enableCameraAndMicrophone();

        // 로컬 비디오 트랙 렌더링
        const localVideoPublication = room.localParticipant.videoTrackPublications.values().next().value;
        if (localVideoPublication?.track) {
            const callerId = Number(document.body.dataset.memberId || 0);
            addVideoTrack(localVideoPublication.track, `member-${callerId}`, true);
        }
    }

    // 화상 통화 화면 추가
    function addVideoTrack(track, participantIdentity, local = false) {
        const element = track.attach();
        element.id = track.sid;

        if (track.kind === "video") {
            const container = createVideoContainer(participantIdentity, local);
            container.append(element);
        } else {
            // 오디오 트랙은 숨겨진 상태로 레이아웃에 추가
            document.getElementById("layout-container")?.append(element);
        }
    }

    // 참가자별 화상 통화 화면 생성
    function createVideoContainer(participantIdentity, local = false) {
        const container = document.createElement("div");
        container.id = `camera-${participantIdentity}`;
        container.className = local ? "video-container local" : "video-container remote";

        const layoutContainer = document.getElementById("layout-container");
        if (local) {
            layoutContainer?.prepend(container); // 본인 화면은 맨 앞에 배치
        } else {
            layoutContainer?.append(container);  // 상대방 화면은 뒤에 배치
        }

        return container;
    }

    // 화상 통화 화면 제거
    function removeVideoContainer(participantIdentity) {
        document.getElementById(`camera-${participantIdentity}`)?.remove();
    }

// -------------------------------------------------------
// 통화 종료
// -------------------------------------------------------

    //
    async function endVideoCall() {
        if (room) {
            await room.disconnect();
            room = null;
        }

        // 레이아웃 컨테이너 비우기
        const layoutContainer = document.getElementById("layout-container");
        if (layoutContainer) layoutContainer.innerHTML = "";

        sessionId = null;
        closeVideoModal();
    }


    function openVideoModal() {
        document.querySelector(".video-page")?.classList.remove("off");
    }

    function closeVideoModal() {
        document.querySelector(".video-page")?.classList.add("off");
    }

    // 브라우저 종료 시 자동 퇴장
    window.addEventListener("beforeunload", () => {
        room?.disconnect();
    });

    const title = document.querySelector(".space-title");
    const editButton = document.querySelector(".edit-btn");
    if (!title || !editButton) return;

    const STORAGE_KEY = "video_space_title";

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) {
        title.textContent = saved.trim();
    }

    editButton.addEventListener("click", () => {
        const current = title.textContent.trim();
        const next = window.prompt("스페이스 이름을 입력하세요", current);
        if (next === null) return;

        const normalized = next.trim();
        if (!normalized) {
            window.alert("이름을 입력해 주세요.");
            return;
        }

        title.textContent = normalized;
        localStorage.setItem(STORAGE_KEY, normalized);
    });
}
