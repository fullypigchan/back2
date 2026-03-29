package com.app.globalgates.service.video_chat;

import com.app.globalgates.domain.video_chat.VideoChatVO;
import com.app.globalgates.dto.chat.ChatRoomDTO;
import com.app.globalgates.dto.video_chat.VideoChatDTO;
import com.app.globalgates.repository.chat.ChatRoomDAO;
import com.app.globalgates.repository.video_chat.VideoChatDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoChatService {
    private final VideoChatDAO videoChatDAO;

    @Transactional
    public VideoChatDTO getOrCreateSession(Long conversationId, Long callerId, Long receiverId) {
        Optional<VideoChatVO> optSession  =  videoChatDAO.findSession(conversationId);
        VideoChatVO session;

        if (optSession.isPresent()) {
            // 기존 세션 꺼내기
            session = optSession.get();
        } else {
            // 새 세션 생성
            VideoChatVO newSession = VideoChatVO.builder()
                    .conversationId(conversationId)
                    .callerId(callerId)
                    .receiverId(receiverId)
                    .build();

            videoChatDAO.saveVideoSession(newSession);
            session = newSession;
        }

        return toDTO(session);
    }

    @Transactional
    public void endSession(Long conversationId) {
        videoChatDAO.updateSessionEnd(conversationId);
    }


    public VideoChatDTO toDTO (VideoChatVO videoChatVO) {
        return VideoChatDTO.builder()
                .id(videoChatVO.getId())
                .conversationId(videoChatVO.getConversationId())
                .callerId(videoChatVO.getCallerId())
                .receiverId(videoChatVO.getReceiverId())
                .startedAt(videoChatVO.getStartedAt())
                .endedAt(videoChatVO.getEndedAt())
                .durationSec(videoChatVO.getDurationSec())
                .createdDatetime(videoChatVO.getCreatedDatetime())
                .build();
    }

}
