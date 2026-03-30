window.onload = () => {
    // LiveKit 설정
    const APPLICATION_SERVER_URL = "https://localhost:6080/";
    const LIVEKIT_URL = "wss://test-7paroumk.livekit.cloud";
    const LivekitClient = window.LivekitClient;

    let room = null;
    let sessionId = null;
    let mediaRecorder = null;
    let audioChunks = [];
    let isRecording = false; // 녹화 상태 추적

    // Toast 알림
    function showToast(message) {
        const existing = document.querySelector(".video-toast");
        if (existing) existing.remove();

        const toast = document.createElement("div");
        toast.className = "video-toast";
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add("show"));
        setTimeout(() => {
            toast.classList.remove("show");
            toast.addEventListener("transitionend", () => toast.remove(), { once: true });
        }, 3000);
    }

    // 1. 페이지 진입 시 URL 파라미터로 자동 입장
    (async () => {
        const params = new URLSearchParams(window.location.search);
        const token    = params.get("token");
        const roomName = params.get("roomName");
        sessionId       = params.get("sessionId");

        if (!token || !roomName) {
            console.error("화상통화 정보가 없습니다. token:", token, "roomName:", roomName);
            return;
        }

        console.log("화상통화 입장 - roomName:", roomName);
        await joinVideoRoom(token, roomName);
    })();

    // 2. LiveKit Room 연결
    async function joinVideoRoom(token, roomName) {
        room = new LivekitClient.Room();

        // 상대방 트랙 수신
        room.on(LivekitClient.RoomEvent.TrackSubscribed, (track, _publication, participant) => {
            console.log("TrackSubscribed 수신 - kind:", track.kind, "/ 참가자:", participant.identity);
            addVideoTrack(track, participant.identity);
        });

        // 상대방 트랙 제거
        room.on(LivekitClient.RoomEvent.TrackUnsubscribed, (track, _publication, participant) => {
            console.log("TrackUnsubscribed - kind:", track.kind, "/ 참가자:", participant.identity);
            track.detach();
            document.getElementById(track.sid)?.remove();
            if (track.kind === "video") removeVideoContainer(participant.identity);
        });

        // 상대방 입장 - 자동 녹화 시작
        room.on(LivekitClient.RoomEvent.ParticipantConnected, (participant) => {
            console.log("참가자 입장:", participant.identity);
            showToast(`${participant.identity}님이 입장했습니다.`);
            // 이미 녹화 중이 아니면 자동 시작
            if (!isRecording) {
                startRecording();
            }
        });

        // 상대방 퇴장 - 화면만 제거 (내 화면 유지)
        room.on(LivekitClient.RoomEvent.ParticipantDisconnected, (participant) => {
            console.log("참가자 퇴장:", participant.identity);
            showToast(`${participant.identity}님이 퇴장했습니다.`);
            removeVideoContainer(participant.identity);
        });

        // 연결 상태 변화 감지 (네트워크 문제 등)
        room.on(LivekitClient.RoomEvent.ConnectionStateChanged, (state) => {
            console.log("연결 상태 변화:", state);
            if (state === LivekitClient.ConnectionState.Reconnecting) {
                showToast("연결이 불안정합니다. 재연결 중...");
            } else if (state === LivekitClient.ConnectionState.Disconnected) {
                showToast("연결이 끊겼습니다.");
            }
        });

        // 참가자 연결 품질 저하 감지
        room.on(LivekitClient.RoomEvent.ParticipantConnectionQualityChanged, (quality, participant) => {
            if (quality === LivekitClient.ConnectionQuality.Lost) {
                showToast(`${participant.identity}님의 연결이 끊겼습니다. 재연결을 기다리는 중...`);
            }
        });

        try {
            await room.connect(LIVEKIT_URL, token);
            console.log("LiveKit 연결 성공 - 내 identity:", room.localParticipant.identity);
            console.log("현재 원격 참가자:", [...room.remoteParticipants.values()].map(p => p.identity));

            // 카메라/마이크 활성화 실패 시 입장 불가
            try {
                await room.localParticipant.enableCameraAndMicrophone();
                console.log("카메라/마이크 활성화 성공");
                showToast("통화에 참여했습니다.");
            } catch (deviceError) {
                console.error("카메라/마이크 사용 불가:", deviceError.message);
                showToast("입장할 수 없었습니다.");
                await room.disconnect();
                room = null;
                setTimeout(() => { window.location.href = "/chat"; }, 2000);
                return;
            }

            // 로컬 비디오 트랙 렌더링
            const localVideoPublication = room.localParticipant.videoTrackPublications.values().next().value;
            if (localVideoPublication?.track) {
                console.log("로컬 트랙 렌더링 - identity:", room.localParticipant.identity);
                addVideoTrack(localVideoPublication.track, room.localParticipant.identity, true);
            }

        } catch (error) {
            console.error("LiveKit 연결 실패:", error.message);
            showToast("통화 연결에 실패했습니다.");
        }
    }

    // 3. 트랙 렌더링
    function addVideoTrack(track, participantIdentity, local = false) {
        if (document.getElementById(track.sid)) return;

        const element = track.attach();
        element.id = track.sid;

        if (track.kind === "video") {
            const container = createVideoContainer(participantIdentity, local);
            container.append(element);
            appendParticipantData(container, participantIdentity + (local ? " (You)" : ""));
        } else {
            document.getElementById("layout-container").append(element);
        }
    }

    // 화상통화 화면 생성
    function createVideoContainer(participantIdentity, local = false) {
        const existing = document.getElementById(`camera-${participantIdentity}`);
        if (existing) return existing;

        const container = document.createElement("div");
        container.id = `camera-${participantIdentity}`;
        container.className = "video-container";
        const layoutContainer = document.getElementById("layout-container");
        if (local) {
            layoutContainer?.prepend(container);
        } else {
            layoutContainer?.append(container);
        }
        return container;
    }

    function appendParticipantData(container, participantIdentity) {
        if (container.querySelector(".participant-data")) return;
        const dataElement = document.createElement("div");
        dataElement.className = "participant-data";
        dataElement.innerHTML = `<p>${participantIdentity}</p>`;
        container.prepend(dataElement);
    }

    function removeVideoContainer(participantIdentity) {
        document.getElementById(`camera-${participantIdentity}`)?.remove();
    }

    // 4. 녹화
    function startRecording() {
        if (isRecording) return;

        audioChunks = [];
        const audioTrack = room?.localParticipant?.audioTrackPublications?.values()?.next()?.value?.track;
        if (!audioTrack) {
            showToast("마이크 트랙을 찾을 수 없습니다.");
            return;
        }

        const stream = new MediaStream([audioTrack.mediaStreamTrack]);
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            const audioUrl = URL.createObjectURL(audioBlob);
            const link = document.createElement("a");
            link.href = audioUrl;
            link.download = `recording_${new Date().getTime()}.webm`;
            link.click();
            showToast("녹화 파일이 저장되었습니다.");
        };

        mediaRecorder.start();
        isRecording = true;
        console.log("녹화 시작");
        showToast("🔴 녹화가 시작되었습니다.");
        updateRecordingUI(true);
    }

    function stopRecording() {
        if (!isRecording) return;
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
        }
        isRecording = false;
        console.log("녹화 중지");
        updateRecordingUI(false);
    }

    // REC 버튼 UI 갱신
    function updateRecordingUI(recording) {
        const recBtn = document.querySelector(".rec-btn");
        if (!recBtn) return;
        if (recording) {
            recBtn.classList.add("recording");
        } else {
            recBtn.classList.remove("recording");
        }
    }

    // REC 버튼 클릭 - 토글
    document.querySelector(".rec-btn")?.addEventListener("click", () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    });

    // 5. 통화 종료 (confirm 추가)
    document.querySelector(".end-btn")?.addEventListener("click", () => {
        const confirmed = window.confirm("통화를 종료하시겠습니까?");
        if (!confirmed) return;
        endVideoCall();
    });

    async function endVideoCall() {
        stopRecording();

        if (room) {
            room.localParticipant.videoTrackPublications.forEach(pub => pub.track?.stop());
            room.localParticipant.audioTrackPublications.forEach(pub => pub.track?.stop());
            await room.disconnect();
            room = null;
        }

        const layoutContainer = document.getElementById("layout-container");
        if (layoutContainer) layoutContainer.innerHTML = "";

        sessionId = null;
        window.location.href = "/chat";
    }

    // 6. space-title 편집
    const title = document.querySelector(".space-title");
    const editButton = document.querySelector(".edit-btn");

    if (title && editButton) {
        const STORAGE_KEY = "video_space_title";
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved?.trim()) title.textContent = saved.trim();

        editButton.addEventListener("click", () => {
            const next = window.prompt("스페이스 이름을 입력하세요", title.textContent.trim());
            if (next === null) return;
            const normalized = next.trim();
            if (!normalized) { window.alert("이름을 입력해 주세요."); return; }
            title.textContent = normalized;
            localStorage.setItem(STORAGE_KEY, normalized);
        });
    }

    // -------------------------------------------------------
    // 7. 브라우저 종료 시 자동 퇴장
    // -------------------------------------------------------
    window.addEventListener("beforeunload", () => {
        room?.disconnect();
    });
};