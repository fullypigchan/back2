package com.app.globalgates.controller.chat;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.repository.MemberDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
public class ChatController {
    private final MemberDAO memberDAO;

    @GetMapping("/chat")
    public String chatPage(
            Authentication authentication,
            @RequestParam(required = false) Long partnerId,
            @RequestParam(required = false) Long conversationId,
            Model model
    ) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            return "redirect:/member/login";
        }

        Long memberId = userDetails.getId();
        MemberDTO currentMember = memberDAO.findByMemberId(memberId)
                .orElseThrow(() -> new IllegalStateException("회원 정보를 찾을 수 없습니다."));

        model.addAttribute("memberId", currentMember.getId());
        model.addAttribute("memberName", currentMember.getMemberName());
        model.addAttribute("memberHandle", currentMember.getMemberHandle());

        if (partnerId != null) {
            MemberDTO partnerMember = memberDAO.findByMemberId(partnerId).orElse(null);
            if (partnerMember != null) {
                model.addAttribute("partnerId", partnerMember.getId());
                model.addAttribute("partnerName", partnerMember.getMemberName());
                model.addAttribute("partnerHandle", partnerMember.getMemberHandle());
            }
        }
        if (conversationId != null) {
            model.addAttribute("conversationId", conversationId);
        }
        return "chat/chat";
    }
}
