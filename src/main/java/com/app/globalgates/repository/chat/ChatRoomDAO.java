package com.app.globalgates.repository.chat;

import com.app.globalgates.dto.chat.ChatRoomDTO;
import com.app.globalgates.mapper.chat.ChatRoomMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ChatRoomDAO {
    private final ChatRoomMapper chatRoomMapper;

//    채팅방 목록 조회
    public List<ChatRoomDTO> findAllByMemberId(Long memberId) {
        return chatRoomMapper.selectAllByMemberId(memberId);
    }

//    두 회원 간 기존 채팅방 조회
    public Optional<ChatRoomDTO> findByMembers(Long senderId, Long invitedId) {
        return chatRoomMapper.selectByMembers(senderId, invitedId);
    }

//    채팅방 생성 (insert 후 DTO에 id 반환)
    public ChatRoomDTO saveConversation(ChatRoomDTO chatRoomDTO) {
        chatRoomMapper.insertConversation(chatRoomDTO);
        return chatRoomDTO;
    }

//    채팅방 회원 관계 생성
    public void saveConversationMemberRel(Long conversationId, Long senderId, Long invitedId) {
        chatRoomMapper.insertConversationMemberRel(conversationId, senderId, invitedId);
    }

//    채팅방 설정 생성
    public void saveSetting(Long conversationId, Long memberId) {
        chatRoomMapper.insertSetting(conversationId, memberId);
    }

//    상대방 정보 조회
    public Optional<ChatRoomDTO> findPartnerByConversation(Long conversationId, Long memberId) {
        return chatRoomMapper.selectPartnerByConversation(conversationId, memberId);
    }

//    마지막 메시지 ID 조회
    public Long findLastMessageId(Long conversationId) {
        return chatRoomMapper.selectLastMessageId(conversationId);
    }

//    읽음 처리
    public void saveLastReadMessageId(Long conversationId, Long memberId, Long lastReadMessageId) {
        chatRoomMapper.upsertLastReadMessageId(conversationId, memberId, lastReadMessageId);
    }

//    별칭 수정
    public void updateAlias(Long conversationId, Long memberId, String alias) {
        chatRoomMapper.updateAlias(conversationId, memberId, alias);
    }

//    뮤트 설정
    public void updateMuted(Long conversationId, Long memberId, boolean muted) {
        chatRoomMapper.updateMuted(conversationId, memberId, muted);
    }

//    뮤트 상태 조회
    public boolean isMuted(Long conversationId, Long memberId) {
        return chatRoomMapper.selectMuted(conversationId, memberId);
    }

//    대화방 soft delete
    public void softDeleteConversation(Long conversationId, Long memberId) {
        chatRoomMapper.softDeleteConversation(conversationId, memberId);
    }

//    대화방 복원 (특정 회원)
    public void restoreConversation(Long conversationId, Long memberId) {
        chatRoomMapper.restoreConversation(conversationId, memberId);
    }

//    삭제 상태인 멤버 ID 목록 조회
    public List<Long> findDeletedMemberIds(Long conversationId) {
        List<Long> ids = chatRoomMapper.selectDeletedMemberIds(conversationId);
        return ids != null ? ids : Collections.emptyList();
    }

//    대화방 복원 (전체 참여자 - 메시지 전송 시)
    public void restoreAllMembers(Long conversationId) {
        chatRoomMapper.restoreAllMembers(conversationId);
    }

//    차단 시점 메시지 ID 저장
    public void updateBlockedAfterMessageId(Long conversationId, Long memberId, Long messageId) {
        chatRoomMapper.updateBlockedAfterMessageId(conversationId, memberId, messageId);
    }

//    차단 해제 시점 메시지 ID 저장
    public void updateBlockReleasedMessageId(Long conversationId, Long memberId, Long messageId) {
        chatRoomMapper.updateBlockReleasedMessageId(conversationId, memberId, messageId);
    }
}
