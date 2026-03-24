package com.app.globalgates.mapper.chat;

import com.app.globalgates.dto.chat.ChatMessageDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ChatMessageMapper {
//    메시지 저장
    void insert(ChatMessageDTO chatMessageDTO);
//    대화 내역 조회 (조인 결과 -> DTO)
    List<ChatMessageDTO> selectAllByConversationId(@Param("conversationId") Long conversationId,
                                                    @Param("memberId") Long memberId);
//    내 계정에서만 메시지 삭제
    void softDeleteForMember(@Param("messageId") Long messageId, @Param("memberId") Long memberId);
}
