package com.app.globalgates.mapper.chat;

import com.app.globalgates.dto.chat.ChatMessageDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ChatMessageMapper {
//    메시지 저장
    void insert(ChatMessageDTO chatMessageDTO);
//    대화 내역 조회 (조인 결과 -> DTO)
    List<ChatMessageDTO> selectAllByConversationId(@Param("conversationId") Long conversationId,
                                                    @Param("memberId") Long memberId);
//    대화 내역 조회 (커서 기반 페이징)
    List<ChatMessageDTO> selectByConversationIdWithCursor(@Param("conversationId") Long conversationId,
                                                          @Param("memberId") Long memberId,
                                                          @Param("cursor") Long cursor,
                                                          @Param("pageSize") int pageSize);
//    내 계정에서만 메시지 삭제
    void softDeleteForMember(@Param("messageId") Long messageId, @Param("memberId") Long memberId);
//    사라진 메시지 설정이 활성화된 대화방 조회
    List<Map<String, Object>> selectActiveDisappearSettings();
//    만료된 메시지 일괄 soft delete
    int softDeleteExpiredMessages(@Param("conversationId") Long conversationId,
                                  @Param("settingActivatedAt") java.time.LocalDateTime settingActivatedAt,
                                  @Param("cutoffTime") java.time.LocalDateTime cutoffTime);
}
