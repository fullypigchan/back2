package com.app.globalgates.controller;

import com.app.globalgates.dto.MemberDTO;
//import com.app.globalgates.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.view.RedirectView;

@Controller
@RequestMapping("/member/**")
@RequiredArgsConstructor
@Slf4j
public class MemberController {
//    private final MemberService memberService;


//    회원가입
    @GetMapping("join")
    public String goToJoinForm(){
        return "member/join";
    }

//    @PostMapping("join")
//    public RedirectView join(MemberDTO memberDTO){
//        memberService.join(memberDTO);
//        return new RedirectView("/member/login");
//    }

//    로그인
    @GetMapping("login")
    public String login(@CookieValue(value="remember", required = false) boolean remember,
                        @CookieValue(value="rememberEmail", required = false) String rememberEmail,
                        Model model){
        model.addAttribute("remember", remember);
        model.addAttribute("rememberEmail", rememberEmail);
        return "member/login";
    }

}

















