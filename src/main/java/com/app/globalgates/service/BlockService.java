package com.app.globalgates.service;

import com.app.globalgates.dto.BlockDTO;
import com.app.globalgates.repository.BlockDAO;
import com.app.globalgates.repository.chat.ChatRoomDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class BlockService {
    private final BlockDAO blockDAO;
    private final ChatRoomDAO chatRoomDAO;

    //    차단 추가
    public void block(BlockDTO blockDTO) {
        blockDAO.save(blockDTO);
    }

    //    차단 해제
    public void unblock(Long blockerId, Long blockedId) {
        blockDAO.delete(blockerId, blockedId);
    }

    //    차단 여부 조회
    public Optional<BlockDTO> getBlock(Long blockerId, Long blockedId) {
        return blockDAO.findByBlockerIdAndBlockedId(blockerId, blockedId);
    }

    //    차단 목록 조회
    public List<BlockDTO> getBlockList(Long blockerId) {
        return blockDAO.findAllByBlockerId(blockerId);
    }

//    양방향 차단 여부 조회 (채팅 연동용)
    public boolean isBlockedEither(Long memberId1, Long memberId2) {
        return blockDAO.isBlockedEither(memberId1, memberId2);
    }

//    차단 추가 + 대화방 차단 시점 기록
    @Transactional
    public void blockWithConversation(BlockDTO blockDTO, Long conversationId, Long lastMessageId) {
        blockDAO.save(blockDTO);
        chatRoomDAO.updateBlockedAfterMessageId(conversationId, blockDTO.getBlockerId(), lastMessageId);
    }

//    차단 해제 + 대화방 차단 해제 시점 기록
    @Transactional
    public void unblockWithConversation(Long blockerId, Long blockedId, Long conversationId, Long lastMessageId) {
        blockDAO.delete(blockerId, blockedId);
        chatRoomDAO.updateBlockReleasedMessageId(conversationId, blockerId, lastMessageId);
    }
}
