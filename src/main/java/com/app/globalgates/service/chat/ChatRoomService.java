package com.app.globalgates.service.chat;

import com.app.globalgates.dto.chat.ChatReadReceiptDTO;
import com.app.globalgates.dto.chat.ChatRoomDTO;
import com.app.globalgates.repository.BlockDAO;
import com.app.globalgates.repository.chat.ChatRoomDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatRoomService {
    private final ChatRoomDAO chatRoomDAO;
    private final BlockDAO blockDAO;

//    채팅방 목록 조회
    public List<ChatRoomDTO> getRooms(Long memberId) {
        return chatRoomDAO.findAllByMemberId(memberId);
    }

//    채팅방 생성 또는 기존 방 반환 (차단 상태면 예외)
    @Transactional
    public ChatRoomDTO createOrGetRoom(String title, Long senderId, Long invitedId) {
        if (blockDAO.isBlockedEither(senderId, invitedId)) {
            throw new IllegalStateException("차단된 사용자와는 대화할 수 없습니다.");
        }

        Optional<ChatRoomDTO> existing = chatRoomDAO.findByMembers(senderId, invitedId);
        if (existing.isPresent()) {
            Long roomId = existing.get().getId();
            chatRoomDAO.saveSetting(roomId, senderId);
            chatRoomDAO.saveSetting(roomId, invitedId);
            chatRoomDAO.restoreConversation(roomId, senderId);
            log.info("기존 채팅방 반환: {}", roomId);
            return existing.get();
        }

        ChatRoomDTO param = ChatRoomDTO.builder().title(title).build();
        ChatRoomDTO newRoom = chatRoomDAO.saveConversation(param);
        log.info("새 채팅방 생성: {}", newRoom.getId());

        chatRoomDAO.saveConversationMemberRel(newRoom.getId(), senderId, invitedId);
        chatRoomDAO.saveSetting(newRoom.getId(), senderId);
        chatRoomDAO.saveSetting(newRoom.getId(), invitedId);

        return newRoom;
    }

//    상대방 정보 조회
    public Optional<ChatRoomDTO> getPartner(Long conversationId, Long memberId) {
        return chatRoomDAO.findPartnerByConversation(conversationId, memberId);
    }

//    채팅방 활성화
    @Transactional
    public void activateRoom(Long conversationId, Long memberId) {
        chatRoomDAO.saveSetting(conversationId, memberId);
    }

//    읽음 처리 + read receipt 반환 (WebSocket 브로드캐스트용)
    @Transactional
    public Optional<ChatReadReceiptDTO> markConversationAsRead(Long conversationId, Long memberId) {
        Long lastMessageId = chatRoomDAO.findLastMessageId(conversationId);
        if (lastMessageId == null) return Optional.empty();

        chatRoomDAO.saveLastReadMessageId(conversationId, memberId, lastMessageId);
        return Optional.of(
                ChatReadReceiptDTO.builder()
                        .conversationId(conversationId)
                        .readerId(memberId)
                        .lastReadMessageId(lastMessageId)
                        .build()
        );
    }

//    조용한 읽음 처리 (DB만 갱신, 브로드캐스트 X)
    @Transactional
    public void markConversationAsReadQuiet(Long conversationId, Long memberId) {
        Long lastMessageId = chatRoomDAO.findLastMessageId(conversationId);
        if (lastMessageId != null) {
            chatRoomDAO.saveLastReadMessageId(conversationId, memberId, lastMessageId);
        }
    }

//    별칭 수정
    @Transactional
    public void updateAlias(Long conversationId, Long memberId, String alias) {
        chatRoomDAO.updateAlias(conversationId, memberId, alias);
    }

//    뮤트 토글
    @Transactional
    public boolean toggleMute(Long conversationId, Long memberId) {
        boolean current = chatRoomDAO.isMuted(conversationId, memberId);
        boolean next = !current;
        chatRoomDAO.updateMuted(conversationId, memberId, next);
        return next;
    }

//    뮤트 상태 조회
    public boolean isMuted(Long conversationId, Long memberId) {
        return chatRoomDAO.isMuted(conversationId, memberId);
    }

//    대화방 soft delete
    @Transactional
    public void softDeleteConversation(Long conversationId, Long memberId) {
        chatRoomDAO.softDeleteConversation(conversationId, memberId);
    }
}
