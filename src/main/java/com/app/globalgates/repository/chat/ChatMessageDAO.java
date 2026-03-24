package com.app.globalgates.repository.chat;

import com.app.globalgates.dto.chat.ChatMessageDTO;
import com.app.globalgates.mapper.chat.ChatMessageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class ChatMessageDAO {
    private final ChatMessageMapper chatMessageMapper;

//    메시지 저장 (insert 후 DTO에 id 반환)
    public ChatMessageDTO save(ChatMessageDTO chatMessageDTO) {
        chatMessageMapper.insert(chatMessageDTO);
        return chatMessageDTO;
    }

//    대화 내역 조회
    public List<ChatMessageDTO> findAllByConversationId(Long conversationId, Long memberId) {
        return chatMessageMapper.selectAllByConversationId(conversationId, memberId);
    }

//    내 계정에서만 메시지 삭제
    public void softDeleteForMember(Long messageId, Long memberId) {
        chatMessageMapper.softDeleteForMember(messageId, memberId);
    }
}
