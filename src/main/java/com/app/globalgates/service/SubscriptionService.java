package com.app.globalgates.service;

import com.app.globalgates.common.enumeration.SubscriptionStatus;
import com.app.globalgates.common.enumeration.SubscriptionTier;
import com.app.globalgates.domain.SubscriptionVO;
import com.app.globalgates.dto.SubscriptionDTO;
import com.app.globalgates.repository.SubscriptionDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class SubscriptionService {
    private final SubscriptionDAO subscriptionDAO;

    //    구독 등록
    public void subscribe(SubscriptionDTO subscriptionDTO) {
        subscriptionDAO.save(subscriptionDTO.toVO());
    }

    //    회원의 현재 구독 조회
    public Optional<SubscriptionDTO> findByMemberId(Long memberId) {
        return subscriptionDAO.findByMemberId(memberId).map(this::toDTO);
    }

    //    구독 플랜 변경 (tier, billingCycle, expiresAt)
    public void changePlan(Long id, SubscriptionTier tier, String billingCycle, String expiresAt) {
        subscriptionDAO.updateTier(id, tier, billingCycle, expiresAt);
    }

    //    구독 해지
    public void cancel(Long id) {
        subscriptionDAO.updateStatus(id, SubscriptionStatus.INACTIVE);
    }

    //    toDTO
    private SubscriptionDTO toDTO(SubscriptionVO vo) {
        SubscriptionDTO dto = new SubscriptionDTO();
        dto.setId(vo.getId());
        dto.setMemberId(vo.getMemberId());
        dto.setTier(vo.getTier());
        dto.setBillingCycle(vo.getBillingCycle());
        dto.setStatus(vo.getStatus());
        dto.setStartedAt(vo.getStartedAt());
        dto.setExpiresAt(vo.getExpiresAt());
        dto.setCreatedDatetime(vo.getCreatedDatetime());
        dto.setUpdatedDatetime(vo.getUpdatedDatetime());
        return dto;
    }
}
