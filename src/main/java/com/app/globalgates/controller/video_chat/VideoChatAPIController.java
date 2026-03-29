package com.app.globalgates.controller.video_chat;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.domain.video_chat.VideoChatVO;
import com.app.globalgates.dto.chat.ChatRoomDTO;
import com.app.globalgates.dto.video_chat.VideoChatDTO;
import com.app.globalgates.service.chat.ChatRoomService;
import com.app.globalgates.service.video_chat.VideoChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/video-chat/**")
@Slf4j
public class VideoChatAPIController {
    private final ChatRoomService chatRoomService;
    private final VideoChatService videoChatService;

    @PostMapping("/session")
    public ResponseEntity<?> getOrCreateSession(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                @RequestBody VideoChatDTO videoChatDTO) {
        Long callerId = userDetails.getId();

        // 채팅방 조회
        ChatRoomDTO chatRoom = chatRoomService.createOrGetRoom(null, callerId, videoChatDTO.getReceiverId());
        // 화상 채팅방 조회
        VideoChatDTO response = videoChatService.getOrCreateSession(
                chatRoom.getId(), callerId, videoChatDTO.getReceiverId()
        );

        return ResponseEntity.ok(response);
    }
}
