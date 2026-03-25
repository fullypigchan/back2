package com.app.globalgates.repository;

import com.app.globalgates.common.enumeration.SubscriptionStatus;
import com.app.globalgates.common.enumeration.SubscriptionTier;
import com.app.globalgates.domain.SubscriptionVO;
import com.app.globalgates.mapper.SubscriptionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class SubscriptionDAO {
    private final SubscriptionMapper subscriptionMapper;

    //    구독 등록
    public void save(SubscriptionVO subscriptionVO) {
        subscriptionMapper.insert(subscriptionVO);
    }

    //    회원 id로 활성 구독 조회
    public Optional<SubscriptionVO> findByMemberId(Long memberId) {
        return subscriptionMapper.selectByMemberId(memberId);
    }

    //    구독 tier 변경
    public void updateTier(Long id, SubscriptionTier tier, String billingCycle, String expiresAt) {
        subscriptionMapper.updateTier(id, tier, billingCycle, expiresAt);
    }

    //    구독 상태 변경
    public void updateStatus(Long id, SubscriptionStatus status) {
        subscriptionMapper.updateStatus(id, status);
    }
}
