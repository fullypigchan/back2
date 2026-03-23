package com.app.globalgates.service;

import com.app.globalgates.dto.BlockDTO;
import com.app.globalgates.repository.BlockDAO;
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
}
