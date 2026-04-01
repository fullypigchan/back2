package com.app.globalgates.controller.setting;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/setting/**")
@RequiredArgsConstructor
@Slf4j
public class SettingController {

    private final MemberService memberService;

    @GetMapping("setting")
    public String goToSetting(@AuthenticationPrincipal CustomUserDetails userDetails, Model model) {
        // 설정 화면은 세션에 흩어진 단편 값을 이어 붙이지 않고,
        // 현재 인증 사용자의 최신 회원 정보를 한 번에 조회해서 템플릿의 단일 진입점으로 사용한다.
        // 이렇게 해야 이메일/전화번호/언어 변경 이후에도 화면이 stale session 값에 묶이지 않는다.
        MemberDTO member = memberService.getMember(userDetails.getLoginId());

        // 템플릿과 프런트는 모두 이 member 객체 하나를 기준으로 초기값을 읽는다.
        // 서버는 "초기값의 출처"를, 프런트는 "화면 전환과 상호작용"을 맡도록 책임을 분리한다.
        model.addAttribute("member", member);
        return "setting/setting";
    }
}
