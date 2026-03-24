package com.app.globalgates.service.chat;

import com.app.globalgates.dto.MessageReactionDTO;
import com.app.globalgates.repository.MessageReactionDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageReactionService {
    private final MessageReactionDAO messageReactionDAO;
    private final SimpMessagingTemplate messagingTemplate;

//    반응 추가
    @Transactional
    public MessageReactionDTO addReaction(Long messageId, Long memberId, String emoji, Long conversationId) {
        MessageReactionDTO param = MessageReactionDTO.builder()
                .messageId(messageId)
                .memberId(memberId)
                .emoji(emoji)
                .build();
        MessageReactionDTO saved = messageReactionDAO.save(param);
        log.info("반응 추가 - messageId: {}, memberId: {}, emoji: {}", messageId, memberId, emoji);

        saved.setConversationId(conversationId);
        messagingTemplate.convertAndSend(
                "/topic/room." + conversationId + ".reaction",
                saved
        );
        return saved;
    }

//    반응 삭제
    @Transactional
    public void removeReaction(Long messageId, Long memberId, String emoji, Long conversationId) {
        messageReactionDAO.delete(messageId, memberId, emoji);
        log.info("반응 삭제 - messageId: {}, memberId: {}, emoji: {}", messageId, memberId, emoji);

        MessageReactionDTO removed = MessageReactionDTO.builder()
                .messageId(messageId)
                .memberId(memberId)
                .emoji(emoji)
                .conversationId(conversationId)
                .removed(true)
                .build();
        messagingTemplate.convertAndSend(
                "/topic/room." + conversationId + ".reaction",
                removed
        );
    }

//    메시지별 반응 조회
    public List<MessageReactionDTO> getReactions(Long messageId) {
        return messageReactionDAO.findAllByMessageId(messageId);
    }
}
