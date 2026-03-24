package com.app.globalgates.controller.chat;

import com.app.globalgates.domain.FileVO;
import com.app.globalgates.dto.chat.ChatMessageDTO;
import com.app.globalgates.dto.chat.ChatReadReceiptDTO;
import com.app.globalgates.dto.chat.ChatRoomDTO;
import com.app.globalgates.dto.chat.ChatExpertDTO;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.MessageReactionDTO;
import com.app.globalgates.service.chat.ChatFileService;
import com.app.globalgates.service.chat.ChatMessageService;
import com.app.globalgates.service.chat.ChatRoomService;
import com.app.globalgates.service.ExpertService;
import com.app.globalgates.service.chat.MessageReactionService;
import com.app.globalgates.service.ProducerService;
import com.app.globalgates.service.S3Service;
import com.app.globalgates.repository.FileDAO;
import com.app.globalgates.repository.MemberDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatAPIController {
    private final ChatRoomService chatRoomService;
    private final ChatMessageService chatMessageService;
    private final ProducerService producerService;
    private final ExpertService expertService;
    private final MessageReactionService messageReactionService;
    private final MemberDAO memberDAO;
    private final FileDAO fileDAO;
    private final S3Service s3Service;
    private final ChatFileService chatFileService;
    private final SimpMessagingTemplate messagingTemplate;

    // 채팅방 목록 조회
    @GetMapping("/rooms/{memberId}")
    public ResponseEntity<List<ChatRoomDTO>> getRooms(@PathVariable Long memberId) {
        log.info("채팅방 목록 조회 - memberId: {}", memberId);
        List<ChatRoomDTO> rooms = chatRoomService.getRooms(memberId);
        return ResponseEntity.ok(rooms);
    }

    // 채팅방 생성 또는 기존 방 반환 (차단 상태면 409)
    @PostMapping("/rooms")
    public ResponseEntity<?> createRoom(@RequestBody Map<String, Object> body) {
        String title = (String) body.getOrDefault("title", "");
        Long senderId = Long.valueOf(body.get("senderId").toString());
        Long invitedId = Long.valueOf(body.get("invitedId").toString());

        log.info("채팅방 생성 요청 - senderId: {}, invitedId: {}", senderId, invitedId);
        try {
            ChatRoomDTO room = chatRoomService.createOrGetRoom(title, senderId, invitedId);
            return ResponseEntity.ok(room);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    // 대화 내역 조회
    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<ChatMessageDTO>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam Long memberId) {
        log.info("대화 내역 조회 - conversationId: {}, memberId: {}", conversationId, memberId);
        List<ChatMessageDTO> messages = chatMessageService.getMessages(conversationId, memberId);
        return ResponseEntity.ok(messages);
    }

    // 메시지 전송 (차단 상태면 403)
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody ChatMessageDTO chatMessageDTO) {
        log.info("메시지 전송 - conversationId: {}, senderId: {}", chatMessageDTO.getConversationId(), chatMessageDTO.getSenderId());
        try {
            ChatMessageDTO saved = producerService.sendMessage(chatMessageDTO);
            return ResponseEntity.ok(saved);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    // 내 계정에서만 메시지 삭제 (per-member soft delete)
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long messageId,
                                              @RequestParam Long memberId) {
        log.info("메시지 삭제 - messageId: {}, memberId: {}", messageId, memberId);
        chatMessageService.deleteMessageForMember(messageId, memberId);
        return ResponseEntity.ok().build();
    }

    // 유저 검색 (차단 사용자 제외)
    @GetMapping("/members/search")
    public ResponseEntity<List<MemberDTO>> searchMembers(
            @RequestParam String keyword,
            @RequestParam Long memberId) {
        log.info("유저 검색 - keyword: {}, memberId: {}", keyword, memberId);
        List<MemberDTO> members = memberDAO.searchByKeyword(keyword, memberId);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/experts")
    public ResponseEntity<List<ChatExpertDTO>> getConnectedExperts(
            @RequestParam Long memberId,
            @RequestParam(required = false) String keyword) {
        log.info("연결된 전문가 조회 - memberId: {}, keyword: {}", memberId, keyword);
        return ResponseEntity.ok(expertService.getConnectedExpertsForChat(memberId, keyword));
    }

    // 상대방 정보 조회
    @GetMapping("/rooms/{conversationId}/partner/{memberId}")
    public ResponseEntity<ChatRoomDTO> getPartner(
            @PathVariable Long conversationId,
            @PathVariable Long memberId) {
        log.info("상대방 정보 조회 - conversationId: {}, memberId: {}", conversationId, memberId);
        return chatRoomService.getPartner(conversationId, memberId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/rooms/{conversationId}/activate")
    public ResponseEntity<Void> activateRoom(
            @PathVariable Long conversationId,
            @RequestParam Long memberId) {
        log.info("채팅방 활성화 - conversationId: {}, memberId: {}", conversationId, memberId);
        chatRoomService.activateRoom(conversationId, memberId);
        return ResponseEntity.noContent().build();
    }

    // 방 입장 시 읽음 처리 (read receipt 브로드캐스트 O)
    @PostMapping("/rooms/{conversationId}/read")
    public ResponseEntity<ChatReadReceiptDTO> markAsRead(
            @PathVariable Long conversationId,
            @RequestParam Long memberId) {
        log.info("대화 읽음 처리 - conversationId: {}, memberId: {}", conversationId, memberId);
        return chatRoomService.markConversationAsRead(conversationId, memberId)
                .map(readReceipt -> {
                    messagingTemplate.convertAndSend(
                            "/topic/room." + conversationId + ".read",
                            readReceipt
                    );
                    return ResponseEntity.ok(readReceipt);
                })
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    // 실시간 수신 중 읽음 처리 (read receipt 브로드캐스트 X, DB만 갱신)
    @PostMapping("/rooms/{conversationId}/read-quiet")
    public ResponseEntity<Void> markAsReadQuiet(
            @PathVariable Long conversationId,
            @RequestParam Long memberId) {
        chatRoomService.markConversationAsReadQuiet(conversationId, memberId);
        return ResponseEntity.noContent().build();
    }

    // 별칭 수정
    @PatchMapping("/rooms/{conversationId}/alias")
    public ResponseEntity<Void> updateAlias(
            @PathVariable Long conversationId,
            @RequestBody Map<String, Object> body) {
        Long memberId = Long.valueOf(body.get("memberId").toString());
        String alias = (String) body.get("alias");
        log.info("별칭 수정 - conversationId: {}, memberId: {}, alias: {}", conversationId, memberId, alias);
        chatRoomService.updateAlias(conversationId, memberId, alias);
        return ResponseEntity.noContent().build();
    }

    // 뮤트 토글
    @PostMapping("/rooms/{conversationId}/mute")
    public ResponseEntity<Map<String, Boolean>> toggleMute(
            @PathVariable Long conversationId,
            @RequestParam Long memberId) {
        log.info("뮤트 토글 - conversationId: {}, memberId: {}", conversationId, memberId);
        boolean muted = chatRoomService.toggleMute(conversationId, memberId);
        return ResponseEntity.ok(Map.of("muted", muted));
    }

    // 대화방 soft delete
    @DeleteMapping("/rooms/{conversationId}")
    public ResponseEntity<Void> softDeleteConversation(
            @PathVariable Long conversationId,
            @RequestParam Long memberId) {
        log.info("대화방 삭제 - conversationId: {}, memberId: {}", conversationId, memberId);
        chatRoomService.softDeleteConversation(conversationId, memberId);
        return ResponseEntity.ok().build();
    }

    // 반응 추가
    @PostMapping("/messages/{messageId}/reactions")
    public ResponseEntity<MessageReactionDTO> addReaction(
            @PathVariable Long messageId,
            @RequestBody Map<String, Object> body) {
        Long memberId = Long.valueOf(body.get("memberId").toString());
        String emoji = (String) body.get("emoji");
        Long conversationId = Long.valueOf(body.get("conversationId").toString());
        log.info("반응 추가 - messageId: {}, memberId: {}, emoji: {}", messageId, memberId, emoji);
        MessageReactionDTO saved = messageReactionService.addReaction(messageId, memberId, emoji, conversationId);
        return ResponseEntity.ok(saved);
    }

    // 반응 삭제
    @DeleteMapping("/messages/{messageId}/reactions")
    public ResponseEntity<Void> removeReaction(
            @PathVariable Long messageId,
            @RequestBody Map<String, Object> body) {
        Long memberId = Long.valueOf(body.get("memberId").toString());
        String emoji = (String) body.get("emoji");
        Long conversationId = Long.valueOf(body.get("conversationId").toString());
        log.info("반응 삭제 - messageId: {}, memberId: {}, emoji: {}", messageId, memberId, emoji);
        messageReactionService.removeReaction(messageId, memberId, emoji, conversationId);
        return ResponseEntity.ok().build();
    }

    // 반응 조회
    @GetMapping("/messages/{messageId}/reactions")
    public ResponseEntity<List<MessageReactionDTO>> getReactions(@PathVariable Long messageId) {
        log.info("반응 조회 - messageId: {}", messageId);
        List<MessageReactionDTO> reactions = messageReactionService.getReactions(messageId);
        return ResponseEntity.ok(reactions);
    }

    // 파일 첨부 메시지 전송 (차단 상태면 403)
    @PostMapping("/send-with-file")
    public ResponseEntity<?> sendMessageWithFile(
            @RequestParam Long conversationId,
            @RequestParam Long senderId,
            @RequestParam String senderName,
            @RequestParam(required = false, defaultValue = "") String content,
            @RequestParam("file") MultipartFile file) throws IOException {
        log.info("파일 첨부 메시지 전송 - conversationId: {}, senderId: {}", conversationId, senderId);
        try {
            ChatMessageDTO dto = new ChatMessageDTO();
            dto.setConversationId(conversationId);
            dto.setSenderId(senderId);
            dto.setSenderName(senderName);
            dto.setContent(content);
            ChatMessageDTO saved = producerService.sendMessageWithFile(dto, file);
            return ResponseEntity.ok(saved);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    // 파일 다운로드 URL 조회
    @GetMapping("/files/{fileId}/download")
    public ResponseEntity<Map<String, String>> getFileDownloadUrl(@PathVariable Long fileId) throws IOException {
        log.info("파일 다운로드 URL 조회 - fileId: {}", fileId);
        Optional<FileVO> fileOpt = fileDAO.findById(fileId);
        if (fileOpt.isEmpty()) return ResponseEntity.notFound().build();
        FileVO file = fileOpt.get();
        String url = s3Service.getPresignedDownloadUrl(
                file.getFilePath(), file.getOriginalName(), Duration.ofMinutes(10));
        return ResponseEntity.ok(Map.of("url", url));
    }

    // 파일 미리보기 URL 조회
    @GetMapping("/files/{fileId}/preview")
    public ResponseEntity<Map<String, String>> getFilePreviewUrl(@PathVariable Long fileId) throws IOException {
        log.info("파일 미리보기 URL 조회 - fileId: {}", fileId);
        Optional<FileVO> fileOpt = fileDAO.findById(fileId);
        if (fileOpt.isEmpty()) return ResponseEntity.notFound().build();
        FileVO file = fileOpt.get();
        String url = s3Service.getPresignedUrl(file.getFilePath(), Duration.ofMinutes(30));
        return ResponseEntity.ok(Map.of("url", url));
    }
}
