package com.app.globalgates.controller.subscribe;

import com.app.globalgates.common.enumeration.PaymentStatus;
import com.app.globalgates.dto.PaymentSubscribeDTO;
import com.app.globalgates.service.PaymentSubscribeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/subscriptions/payment")
@Slf4j
public class PaymentSubscribeAPIController {
    private final PaymentSubscribeService paymentSubscribeService;

    //    결제 정보 저장
    @PostMapping("/save")
    public void save(@RequestBody PaymentSubscribeDTO paymentSubscribeDTO) {
        log.info("구독 결제 정보 저장: {}", paymentSubscribeDTO);
        paymentSubscribeService.save(paymentSubscribeDTO);
    }

    //    결제 상세 조회
    @GetMapping("/detail")
    public PaymentSubscribeDTO detail(@RequestParam Long id) {
        log.info("구독 결제 조회: id={}", id);
        return paymentSubscribeService.findById(id);
    }

    //    가상계좌 웹훅 처리
    @PostMapping("/webhook")
    public ResponseEntity<?> webhook(@RequestBody Map<String, Object> webhookData) {
        log.info("구독 결제 웹훅 수신: {}", webhookData);

        String receiptId = (String) webhookData.get("receipt_id");
        String event = (String) webhookData.get("event");

        if ("issued".equals(event) || "done".equals(event)) {
            String paidAt = (String) webhookData.get("purchased_at");
            paymentSubscribeService.updateStatus(receiptId, PaymentStatus.COMPLETED, paidAt);
            log.info("구독 결제 완료 처리: receiptId={}", receiptId);
        }

        return ResponseEntity.ok("webhook received");
    }
}
