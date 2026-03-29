package com.app.globalgates.controller.community;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.CommunityDTO;
import com.app.globalgates.service.CommunityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequiredArgsConstructor
@RequestMapping("/community")
@Slf4j
public class CommunityController {

    private final CommunityService communityService;

    @GetMapping
    public String goToCommunityPage(@AuthenticationPrincipal CustomUserDetails userDetails,
                                    Model model) {
        model.addAttribute("memberId", userDetails != null ? userDetails.getId() : null);
        return "community/community";
    }

    @GetMapping("/{id}")
    public String goToCommunityDetailPage(@PathVariable Long id,
                                          @AuthenticationPrincipal CustomUserDetails userDetails,
                                          Model model) {
        // 삭제된(inactive) 커뮤니티 접근 차단
        try {
            Long memberId = userDetails != null ? userDetails.getId() : null;
            CommunityDTO community = communityService.getCommunityDetail(id, memberId);
            if ("inactive".equals(community.getCommunityStatus())) {
                return "redirect:/community";
            }
        } catch (Exception e) {
            return "redirect:/community";
        }

        model.addAttribute("communityId", id);
        model.addAttribute("memberId", userDetails != null ? userDetails.getId() : null);
        return "community/community-detailed";
    }
}
