package com.app.globalgates.service;

import com.app.globalgates.common.enumeration.BadgeType;
import com.app.globalgates.common.enumeration.MemberRole;
import com.app.globalgates.common.enumeration.SubscriptionStatus;
import com.app.globalgates.common.enumeration.SubscriptionTier;
import com.app.globalgates.domain.BadgeVO;
import com.app.globalgates.dto.BadgeDTO;
import com.app.globalgates.dto.SubscriptionDTO;
import com.app.globalgates.repository.BadgeDAO;
import com.app.globalgates.repository.MemberDAO;
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
    private final MemberDAO memberDAO;
    private final BadgeDAO badgeDAO;

    //    구독하기 + (member_role + badge) 변경
    public Long subscribe(SubscriptionDTO subscriptionDTO) {
        subscriptionDTO.setStatus(SubscriptionStatus.ACTIVE);
        subscriptionDAO.save(subscriptionDTO);

        Long memberId = subscriptionDTO.getMemberId();
        SubscriptionTier tier = subscriptionDTO.getTier();

        //    expert 구독 = member_role을 expert로 변경, 그 외에는 business 그대로
        if (tier == SubscriptionTier.EXPERT) {
            memberDAO.setMemberRole(memberId, MemberRole.EXPERT);
        }

        //    tier로 badge 나뉨 (free는 없음)
        if (tier != SubscriptionTier.FREE) {
            BadgeType badgeType = BadgeType.getBadgeType(tier.getValue());
            Optional<BadgeVO> existingBadge = badgeDAO.findByMemberId(memberId);
            if (existingBadge.isPresent()) {
                badgeDAO.setBadgeType(existingBadge.get().getId(), badgeType);
            } else {
                BadgeDTO badgeDTO = new BadgeDTO();
                badgeDTO.setMemberId(memberId);
                badgeDTO.setBadgeType(badgeType);
                badgeDAO.save(badgeDTO.toVO());
            }
        }

        return subscriptionDTO.getId();
    }

    //    로그인한사람 어떤 구독인지조회
    public Optional<SubscriptionDTO> findByMemberId(Long memberId) {
        return subscriptionDAO.findByMemberId(memberId);
    }

    //    구독 플랜변경 (tier, billingCycle, expiresAt) + member_role, badge 변경
    public void changePlan(Long id, Long memberId, SubscriptionTier tier, String billingCycle, String expiresAt) {
        subscriptionDAO.updateTier(id, tier, billingCycle, expiresAt);

        if (tier == SubscriptionTier.EXPERT) {
            memberDAO.setMemberRole(memberId, MemberRole.EXPERT);
        } else {
            memberDAO.setMemberRole(memberId, MemberRole.BUSINESS);
        }

        if (tier != SubscriptionTier.FREE) {
            BadgeType badgeType = BadgeType.getBadgeType(tier.getValue());
            Optional<BadgeVO> existingBadge = badgeDAO.findByMemberId(memberId);
            if (existingBadge.isPresent()) {
                badgeDAO.setBadgeType(existingBadge.get().getId(), badgeType);
            } else {
                BadgeDTO badgeDTO = new BadgeDTO();
                badgeDTO.setMemberId(memberId);
                badgeDTO.setBadgeType(badgeType);
                badgeDAO.save(badgeDTO.toVO());
            }
        } else {
            badgeDAO.deleteByMemberId(memberId);
        }
    }

    //    구독 해지 = 월끝나면 member_role을 business로 하고 badge도 삭제
    public void cancel(Long id, Long memberId) {
        subscriptionDAO.updateStatus(id, SubscriptionStatus.INACTIVE);
        memberDAO.setMemberRole(memberId, MemberRole.BUSINESS);
        badgeDAO.deleteByMemberId(memberId);
    }
}
