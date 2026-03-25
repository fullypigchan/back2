package com.app.globalgates.controller;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.SubscriptionDTO;
import com.app.globalgates.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/subscriptions")
@Slf4j
public class SubscriptionAPIController {
    private final SubscriptionService subscriptionService;

    //    구독 등록
    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody SubscriptionDTO subscriptionDTO,
                                       @AuthenticationPrincipal CustomUserDetails userDetails) {
        subscriptionDTO.setMemberId(userDetails.getId());
        log.info("구독 등록 요청: {}", subscriptionDTO);
        subscriptionService.subscribe(subscriptionDTO);
        return ResponseEntity.ok("구독 등록 성공");
    }

    //    현재 구독 조회
    @GetMapping("/my")
    public ResponseEntity<?> my(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Optional<SubscriptionDTO> subscription = subscriptionService.findByMemberId(userDetails.getId());
        return ResponseEntity.ok(subscription.orElse(null));
    }

    //    구독 플랜 변경
    @PutMapping("/change")
    public ResponseEntity<?> changePlan(@RequestBody SubscriptionDTO subscriptionDTO,
                                        @AuthenticationPrincipal CustomUserDetails userDetails) {
        log.info("구독 플랜 변경 요청: {}", subscriptionDTO);
        subscriptionService.changePlan(subscriptionDTO.getId(), subscriptionDTO.getTier(),
                subscriptionDTO.getBillingCycle(), subscriptionDTO.getExpiresAt());
        return ResponseEntity.ok("구독 플랜 변경 성공");
    }

    //    구독 해지
    @PutMapping("/cancel")
    public ResponseEntity<?> cancel(@RequestBody SubscriptionDTO subscriptionDTO) {
        log.info("구독 해지 요청: subscriptionId={}", subscriptionDTO.getId());
        subscriptionService.cancel(subscriptionDTO.getId());
        return ResponseEntity.ok("구독 해지 성공");
    }
}
