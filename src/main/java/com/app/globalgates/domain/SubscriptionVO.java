package com.app.globalgates.domain;

import com.app.globalgates.common.enumeration.SubscriptionStatus;
import com.app.globalgates.common.enumeration.SubscriptionTier;
import lombok.*;

@Getter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class SubscriptionVO {
    private Long id;
    private Long memberId;
    private SubscriptionTier tier;
    private String billingCycle;
    private SubscriptionStatus status;
    private String startedAt;
    private String expiresAt;
    private String createdDatetime;
    private String updatedDatetime;
}
