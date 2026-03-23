package com.app.globalgates.controller.payment;

import com.app.globalgates.common.enumeration.PaymentStatus;
import com.app.globalgates.dto.PaymentAdvertisementDTO;
import com.app.globalgates.service.AdvertisementService;
import com.app.globalgates.service.PaymentAdvertisementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payment")
@Slf4j
public class PaymentController {
    private final PaymentAdvertisementService paymentAdvertisementService;
    private final AdvertisementService advertisementService;

    // 결제 정보 저장
    @PostMapping("save")
    public ResponseEntity<?> save(@RequestBody PaymentAdvertisementDTO paymentAdvertisementDTO) {
        log.info("받아온 결제 정보: {}", paymentAdvertisementDTO);
        paymentAdvertisementService.save(paymentAdvertisementDTO);
        return ResponseEntity.ok("결제 정보 저장 성공!");
    }

    // 결제 상세 조회
    @GetMapping("detail")
    public ResponseEntity<?> detail(@RequestParam Long id) {
        PaymentAdvertisementDTO result = paymentAdvertisementService.findById(id);
        return ResponseEntity.ok(result);
    }

    // 가상계좌 웹훅 처리
    @PostMapping("webhook")
    public ResponseEntity<?> webhook(@RequestBody Map<String, Object> webhookData) {
        log.info("웹훅 수신: {}", webhookData);

        String receiptId    = (String) webhookData.get("receipt_id");
        String event        = (String) webhookData.get("event");

        // 입금 완료 이벤트만 처리
        if ("issued".equals(event) || "done".equals(event)) {
            String paidAt = (String) webhookData.get("purchased_at");
            paymentAdvertisementService.updateStatus(receiptId, PaymentStatus.COMPLETED, paidAt);
            log.info("가상계좌 입금 완료 처리: receiptId={}", receiptId);
        }

        return ResponseEntity.ok("webhook received");
    }
}
