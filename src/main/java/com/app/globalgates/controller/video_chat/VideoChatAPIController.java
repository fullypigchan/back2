package com.app.globalgates.controller.video_chat;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.domain.video_chat.VideoChatVO;
import com.app.globalgates.dto.chat.ChatRoomDTO;
import com.app.globalgates.dto.video_chat.VideoChatDTO;
import com.app.globalgates.service.S3Service;
import com.app.globalgates.service.chat.ChatRoomService;
import com.app.globalgates.service.video_chat.VideoChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/video-chat/**")
@Slf4j
public class VideoChatAPIController {
    private final ChatRoomService chatRoomService;
    private final VideoChatService videoChatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final S3Service s3Service;

    @PostMapping("session")
    public ResponseEntity<?> requestVideoCall(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody VideoChatDTO videoChatDTO) {

        Long callerId = userDetails.getId();

        // 채팅방 조회 or 생성
        ChatRoomDTO chatRoom = chatRoomService.createOrGetRoom(
                null, callerId, videoChatDTO.getReceiverId()
        );

        // 화상 세션 조회 or 생성
        VideoChatDTO session = videoChatService.getOrCreateSession(
                chatRoom.getId(), callerId, videoChatDTO.getReceiverId()
        );

        // roomName 세팅
        String roomName = "conversation-" + chatRoom.getId();
        session.setRoomName(roomName);

        log.info("화상통화 요청 - callerId: {}, receiverId: {}, roomName: {}",
                callerId, videoChatDTO.getReceiverId(), roomName);

        // 상대방에게 STOMP로 통화 요청 알림 전송
        messagingTemplate.convertAndSend(
                "/topic/video-call." + videoChatDTO.getReceiverId(),
                Map.of(
                        "type", "REQUEST",
                        "callerId", callerId,
                        "callerName", userDetails.getMemberName(),
                        "receiverId", videoChatDTO.getReceiverId(),
                        "roomName", roomName,
                        "sessionId", session.getId()
                )
        );

        return ResponseEntity.ok(session);
    }

    // 녹화된 파일 s3 서버에 저장
    @PostMapping("recording")
    public ResponseEntity<?> uploadRecording(@RequestParam("file") MultipartFile file,
                                             @RequestParam("sessionId") String sessionId,
                                             @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            String fileName = "recording/" + userDetails.getId() + "/"
                    + sessionId + "_" + System.currentTimeMillis() + ".webm";

            // 녹음 파일 등록
            String url = s3Service.uploadFile(file, fileName);

            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("errorMessage", "업로드 실패: " + e.getMessage()));
        }
    }

    // 로그인한 본인 확인
    @GetMapping("me")
    public ResponseEntity<?> getMyId(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(Map.of("memberId", userDetails.getId()));
    }

    @PostMapping("/session/reject")
    public ResponseEntity<?> rejectVideoCall(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> body) {

        Long callerId = Long.valueOf(body.get("callerId").toString());
        String callerName = userDetails.getUsername();

        log.info("화상통화 거절 - callerId: {}, rejecterId: {}", callerId, userDetails.getId());

        // 발신자에게 거절 알림 전송
        messagingTemplate.convertAndSend(
                "/topic/video-call." + callerId,
                Map.of(
                        "type", "REJECTED",
                        "callerName", callerName
                )
        );

        return ResponseEntity.ok().build();
    }

    @PostMapping("session/end")
    public ResponseEntity<Void> endSession(@RequestParam Long conversationId) {
        videoChatService.endSession(conversationId);
        return ResponseEntity.ok().build();
    }
}
