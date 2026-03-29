package com.app.globalgates.mapper;

import com.app.globalgates.common.enumeration.SubscriptionStatus;
import com.app.globalgates.common.enumeration.SubscriptionTier;
import com.app.globalgates.dto.SubscriptionDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface SubscriptionMapper {
    //    구독 등록 (useGeneratedKeys로 ID 세팅)
    void insert(SubscriptionDTO subscriptionDTO);

    //    회원 id로 활성 구독 조회
    Optional<SubscriptionDTO> selectByMemberId(Long memberId);

    //    구독 tier 변경
    void updateTier(@Param("id") Long id, @Param("tier") SubscriptionTier tier,
                    @Param("billingCycle") String billingCycle, @Param("expiresAt") String expiresAt);

    //    구독 상태 변경
    void updateStatus(@Param("id") Long id, @Param("status") SubscriptionStatus status);
}
