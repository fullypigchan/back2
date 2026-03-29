package com.app.globalgates.repository;

import com.app.globalgates.common.enumeration.SubscriptionStatus;
import com.app.globalgates.common.enumeration.SubscriptionTier;
import com.app.globalgates.dto.SubscriptionDTO;
import com.app.globalgates.mapper.SubscriptionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class SubscriptionDAO {
    private final SubscriptionMapper subscriptionMapper;

    //    구독
    public void save(SubscriptionDTO subscriptionDTO) {
        subscriptionMapper.insert(subscriptionDTO);
    }

    //    어떤 구독 조회
    public Optional<SubscriptionDTO> findByMemberId(Long memberId) {
        return subscriptionMapper.selectByMemberId(memberId);
    }

    //    구독티어 변경
    public void updateTier(Long id, SubscriptionTier tier, String billingCycle, String expiresAt) {
        subscriptionMapper.updateTier(id, tier, billingCycle, expiresAt);
    }

    //    구독 상태 변경
    public void updateStatus(Long id, SubscriptionStatus status) {
        subscriptionMapper.updateStatus(id, status);
    }
}
