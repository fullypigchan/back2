package com.app.globalgates.controller;

import com.app.globalgates.auth.JwtTokenProvider;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.service.MemberService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/bookmark")
@RequiredArgsConstructor
public class BookmarkController {
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberService memberService;

    @GetMapping("")
    public String goToBookmark(HttpServletRequest request, Model model) {
        Long memberId = 0L;
        try {
            String token = jwtTokenProvider.parseTokenFromHeader(request);
            String loginId = jwtTokenProvider.getUsername(token);
            MemberDTO member = memberService.getMember(loginId);
            memberId = member.getId();
        } catch (Exception e) {
            memberId = 0L;
        }

        model.addAttribute("memberId", memberId);
        return "bookmark/bookmark";
    }
}