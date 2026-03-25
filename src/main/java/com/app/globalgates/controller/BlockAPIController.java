package com.app.globalgates.controller;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.BlockDTO;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.repository.chat.ChatRoomDAO;
import com.app.globalgates.repository.MemberDAO;
import com.app.globalgates.service.BlockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/blocks")
@RequiredArgsConstructor
@Slf4j
public class BlockAPIController {
    private final BlockService blockService;
    private final MemberDAO memberDAO;
    private final ChatRoomDAO chatRoomDAO;

//    차단 추가
    @PostMapping
    public ResponseEntity<Void> block(@RequestBody Map<String, Object> body) {
        Long blockerId = Long.valueOf(body.get("blockerId").toString());
        Long blockedId = Long.valueOf(body.get("blockedId").toString());
        Long conversationId = body.get("conversationId") != null
                ? Long.valueOf(body.get("conversationId").toString()) : null;
        log.info("차단 추가 - blockerId: {}, blockedId: {}, conversationId: {}", blockerId, blockedId, conversationId);

        BlockDTO blockDTO = new BlockDTO();
        blockDTO.setBlockerId(blockerId);
        blockDTO.setBlockedId(blockedId);

        if (conversationId != null) {
            Long lastMessageId = chatRoomDAO.findLastMessageId(conversationId);
            blockService.blockWithConversation(blockDTO, conversationId, lastMessageId != null ? lastMessageId : 0L);
        } else {
            blockService.block(blockDTO);
        }
        return ResponseEntity.ok().build();
    }

//    차단 해제
    @DeleteMapping
    public ResponseEntity<Void> unblock(@RequestParam Long blockerId, @RequestParam Long blockedId,
                                         @RequestParam(required = false) Long conversationId) {
        log.info("차단 해제 - blockerId: {}, blockedId: {}, conversationId: {}", blockerId, blockedId, conversationId);
        if (conversationId != null) {
            Long lastMessageId = chatRoomDAO.findLastMessageId(conversationId);
            blockService.unblockWithConversation(blockerId, blockedId, conversationId, lastMessageId != null ? lastMessageId : 0L);
        } else {
            blockService.unblock(blockerId, blockedId);
        }
        return ResponseEntity.ok().build();
    }

//    차단 여부 조회
    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> isBlocked(
            @RequestParam Long blockerId, @RequestParam Long blockedId) {
        boolean blocked = blockService.getBlock(blockerId, blockedId).isPresent();
        return ResponseEntity.ok(Map.of("blocked", blocked));
    }

//    차단 목록 조회
    @GetMapping("/{blockerId}")
    public ResponseEntity<List<BlockDTO>> getBlockList(@PathVariable Long blockerId) {
        log.info("차단 목록 조회 - blockerId: {}", blockerId);
        List<BlockDTO> blockList = blockService.getBlockList(blockerId);
        return ResponseEntity.ok(blockList);
    }

//    handle 기반 차단 (SecurityContext에서 blockerId 자동 추출)
    @PostMapping("/by-handle")
    public ResponseEntity<?> blockByHandle(@RequestBody Map<String, String> body) {
        String blockedHandle = body.get("blockedHandle");
        if (blockedHandle == null || blockedHandle.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "blockedHandle이 필요합니다"));
        }

        // @ 접두사 제거
        blockedHandle = blockedHandle.startsWith("@") ? blockedHandle.substring(1) : blockedHandle;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다"));
        }
        Long blockerId = userDetails.getId();
        if (blockerId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "로그인 사용자를 찾을 수 없습니다"));
        }

        MemberDTO blocked = memberDAO.findByHandle(blockedHandle)
                .orElse(null);
        if (blocked == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "차단 대상을 찾을 수 없습니다"));
        }

        log.info("handle 기반 차단 - blockerId: {}, blockedId: {} (handle: {})", blockerId, blocked.getId(), blockedHandle);

        BlockDTO blockDTO = new BlockDTO();
        blockDTO.setBlockerId(blockerId);
        blockDTO.setBlockedId(blocked.getId());
        blockService.block(blockDTO);
        return ResponseEntity.ok().build();
    }
}
