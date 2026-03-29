package com.app.globalgates.controller.subscribe;

import com.app.globalgates.dto.SubscriptionDTO;
import com.app.globalgates.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/subscriptions")
@Slf4j
public class SubscriptionAPIController {
    private final SubscriptionService subscriptionService;

    //    구독 등록 (생성된 subscription ID 반환)
    @PostMapping("/subscribe")
    public Long subscribe(@RequestBody SubscriptionDTO subscriptionDTO) {
        log.info("구독 등록 요청: {}", subscriptionDTO);
        return subscriptionService.subscribe(subscriptionDTO);
    }

    //    현재 구독 조회
    @GetMapping("/my")
    public SubscriptionDTO my(@RequestParam Long memberId) {
        log.info("구독 조회 요청: memberId={}", memberId);
        return subscriptionService.findByMemberId(memberId).orElse(null);
    }

    //    구독 플랜 변경
    @PostMapping("/change")
    public void changePlan(@RequestBody SubscriptionDTO subscriptionDTO) {
        log.info("구독 플랜 변경 요청: {}", subscriptionDTO);
        subscriptionService.changePlan(subscriptionDTO.getId(), subscriptionDTO.getMemberId(),
                subscriptionDTO.getTier(), subscriptionDTO.getBillingCycle(), subscriptionDTO.getExpiresAt());
    }

    //    구독 해지
    @PostMapping("/cancel")
    public void cancel(@RequestBody SubscriptionDTO subscriptionDTO) {
        log.info("구독 해지 요청: subscriptionId={}", subscriptionDTO.getId());
        subscriptionService.cancel(subscriptionDTO.getId(), subscriptionDTO.getMemberId());
    }
}
