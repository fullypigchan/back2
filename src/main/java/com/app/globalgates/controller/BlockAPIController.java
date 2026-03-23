package com.app.globalgates.controller;

import com.app.globalgates.dto.BlockDTO;
import com.app.globalgates.service.BlockService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/blocks")
public class BlockAPIController {
    private final BlockService blockService;

    //    차단 추가
    @PostMapping
    public void block(@RequestBody BlockDTO blockDTO) {
        blockService.block(blockDTO);
    }

    //    차단 해제
    @PostMapping("/{blockerId}/{blockedId}/delete")
    public void unblock(@PathVariable Long blockerId, @PathVariable Long blockedId) {
        blockService.unblock(blockerId, blockedId);
    }

    //    차단 여부 조회
    @GetMapping("/{blockerId}/{blockedId}")
    public boolean isBlocked(@PathVariable Long blockerId, @PathVariable Long blockedId) {
        return blockService.getBlock(blockerId, blockedId).isPresent();
    }

    //    차단 목록 조회
    @GetMapping("/members/{memberId}")
    public List<BlockDTO> getBlockList(@PathVariable Long memberId) {
        return blockService.getBlockList(memberId);
    }
}
