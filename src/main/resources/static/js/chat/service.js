// ChatService IIFE 모듈
const ChatService = (() => {

    // 1.채팅방 목록 조회
    const getRooms = async (memberId) => {
        const response = await fetch(`/api/v1/chat/rooms/${memberId}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "채팅방 목록 조회 실패");
        }
        return await response.json();
    };

    // 2.채팅방 생성
    const createRoom = async (title, senderId, invitedId) => {
        const response = await fetch("/api/v1/chat/rooms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, senderId, invitedId }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "채팅방 생성 실패");
        }
        return await response.json();
    };

    // 3.대화 내역 조회
    const getMessages = async (conversationId, memberId) => {
        const response = await fetch(
            `/api/v1/chat/conversations/${conversationId}/messages?memberId=${memberId}`
        );
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "대화 내역 조회 실패");
        }
        return await response.json();
    };

    // 4.메시지 전송
    const sendMessage = async (conversationId, senderId, senderName, content) => {
        const body = { conversationId, senderId, senderName, content };
        const response = await fetch("/api/v1/chat/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "메시지 전송 실패");
        }
        return await response.json();
    };

    // 5.읽음 처리 - 방 입장시 호출, read receipt 브로드캐스트 O
    const markAsRead = async (conversationId, memberId) => {
        const response = await fetch(
            `/api/v1/chat/rooms/${conversationId}/read?memberId=${memberId}`,
            { method: "POST" }
        );
        if (!response.ok && response.status !== 204) {
            const errorText = await response.text();
            throw new Error(errorText || "읽음 처리 실패");
        }
        if (response.status === 204) return null;
        return await response.json();
    };

    // 6.조용한 읽음 처리 - 실시간 수신중 호출, DB만 갱신, 브로드캐스트 X
    const markAsReadQuiet = async (conversationId, memberId) => {
        const response = await fetch(
            `/api/v1/chat/rooms/${conversationId}/read-quiet?memberId=${memberId}`,
            { method: "POST" }
        );
        if (!response.ok && response.status !== 204) {
            const errorText = await response.text();
            throw new Error(errorText || "조용한 읽음 처리 실패");
        }
    };

    // 7.메시지 삭제 - 내 계정에서만 삭제
    const deleteMessage = async (messageId, memberId) => {
        const response = await fetch(`/api/v1/chat/messages/${messageId}?memberId=${memberId}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "메시지 삭제 실패");
        }
    };

    // 8.유저 검색 (차단 사용자 제외)
    const searchMembers = async (keyword, memberId) => {
        const response = await fetch(
            `/api/v1/chat/members/search?keyword=${encodeURIComponent(keyword)}&memberId=${memberId}`
        );
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "유저 검색 실패");
        }
        return await response.json();
    };

    // 9.연결된 전문가 목록 조회
    const getConnectedExperts = async (memberId, keyword) => {
        const params = new URLSearchParams({ memberId: String(memberId) });
        if (keyword && keyword.trim()) {
            params.set("keyword", keyword.trim());
        }
        const response = await fetch(`/api/v1/chat/experts?${params.toString()}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "연결된 전문가 조회 실패");
        }
        return await response.json();
    };

    // 10.상대방 정보 조회
    const getPartner = async (conversationId, memberId) => {
        const response = await fetch(
            `/api/v1/chat/rooms/${conversationId}/partner/${memberId}`
        );
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "상대방 정보 조회 실패");
        }
        return await response.json();
    };

    // 11.채팅방 활성화
    const activateRoom = async (conversationId, memberId) => {
        const params = new URLSearchParams({ memberId: String(memberId) });
        const response = await fetch(
            `/api/v1/chat/rooms/${conversationId}/activate?${params.toString()}`,
            { method: "POST" }
        );
        if (!response.ok && response.status !== 204) {
            const errorText = await response.text();
            throw new Error(errorText || "채팅방 활성화 실패");
        }
    };

    // 12.반응 추가
    const addReaction = async (messageId, memberId, emoji, conversationId) => {
        const response = await fetch(`/api/v1/chat/messages/${messageId}/reactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memberId, emoji, conversationId }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "반응 추가 실패");
        }
        return await response.json();
    };

    // 13.반응 삭제
    const removeReaction = async (messageId, memberId, emoji, conversationId) => {
        const response = await fetch(`/api/v1/chat/messages/${messageId}/reactions`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memberId, emoji, conversationId }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "반응 삭제 실패");
        }
    };

    // 14.반응 조회
    const getReactions = async (messageId) => {
        const response = await fetch(`/api/v1/chat/messages/${messageId}/reactions`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "반응 조회 실패");
        }
        return await response.json();
    };

    // 15.별칭 수정
    const updateAlias = async (conversationId, memberId, alias) => {
        const response = await fetch(`/api/v1/chat/rooms/${conversationId}/alias`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memberId, alias }),
        });
        if (!response.ok && response.status !== 204) {
            const errorText = await response.text();
            throw new Error(errorText || "별칭 수정 실패");
        }
    };

    // 16.뮤트 토글
    const toggleMute = async (conversationId, memberId) => {
        const response = await fetch(
            `/api/v1/chat/rooms/${conversationId}/mute?memberId=${memberId}`,
            { method: "POST" }
        );
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "뮤트 토글 실패");
        }
        return await response.json();
    };

    // 17.대화방 삭제
    const deleteConversation = async (conversationId, memberId) => {
        const response = await fetch(
            `/api/v1/chat/rooms/${conversationId}?memberId=${memberId}`,
            { method: "DELETE" }
        );
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "대화방 삭제 실패");
        }
    };

    // 18.파일 첨부 메시지 전송
    const sendMessageWithFile = async (conversationId, senderId, senderName, content, file) => {
        const formData = new FormData();
        formData.append("conversationId", conversationId);
        formData.append("senderId", senderId);
        formData.append("senderName", senderName);
        formData.append("content", content);
        formData.append("file", file);
        const response = await fetch("/api/v1/chat/send-with-file", {
            method: "POST",
            body: formData,
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "파일 첨부 메시지 전송 실패");
        }
        return await response.json();
    };

    // 17.파일 다운로드 URL 조회
    const getFileDownloadUrl = async (fileId) => {
        const response = await fetch(`/api/v1/chat/files/${fileId}/download`);
        if (!response.ok) throw new Error("파일 다운로드 URL 조회 실패");
        const data = await response.json();
        return data.url;
    };

    // 18.파일 미리보기 URL 조회
    const getFilePreviewUrl = async (fileId) => {
        const response = await fetch(`/api/v1/chat/files/${fileId}/preview`);
        if (!response.ok) throw new Error("파일 미리보기 URL 조회 실패");
        const data = await response.json();
        return data.url;
    };

    // 19.차단 여부 확인
    const isBlocked = async (blockerId, blockedId) => {
        const response = await fetch(
            `/api/v1/blocks/check?blockerId=${blockerId}&blockedId=${blockedId}`
        );
        if (!response.ok) return false;
        const data = await response.json();
        return data.blocked;
    };

    // 20.사용자 차단
    const blockUser = async (blockerId, blockedId, conversationId) => {
        const response = await fetch("/api/v1/blocks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blockerId, blockedId, conversationId }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "차단 실패");
        }
    };

    // 21.사용자 차단 해제
    const unblockUser = async (blockerId, blockedId, conversationId) => {
        let url = `/api/v1/blocks?blockerId=${blockerId}&blockedId=${blockedId}`;
        if (conversationId) url += `&conversationId=${conversationId}`;
        const response = await fetch(url, { method: "DELETE" });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "차단 해제 실패");
        }
    };

    return {
        getRooms,
        createRoom,
        getMessages,
        sendMessage,
        markAsRead,
        markAsReadQuiet,
        deleteMessage,
        searchMembers,
        getConnectedExperts,
        getPartner,
        activateRoom,
        addReaction,
        removeReaction,
        getReactions,
        updateAlias,
        toggleMute,
        deleteConversation,
        sendMessageWithFile,
        getFileDownloadUrl,
        getFilePreviewUrl,
        isBlocked,
        blockUser,
        unblockUser,
    };
})();
