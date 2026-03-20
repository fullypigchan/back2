package com.app.globalgates.controller;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.auth.JwtTokenProvider;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.service.MemberService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth/**")
@Slf4j

public class AuthController implements AuthControllerDocs {
    private final MemberService memberService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTemplate redisTemplate;
    private final HttpServletResponse response;

    //    로그인
    @PostMapping("login")
    public ResponseEntity<?> login(@RequestBody MemberDTO memberDTO){
        log.info("memberDTO: {}", memberDTO);
        try {
            Map<String, String> tokenMap = new HashMap<>();

            Authentication authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(memberDTO.getMemberEmail(), memberDTO.getMemberPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.info("authentication: {}", (CustomUserDetails) authentication.getPrincipal());

            String accessToken = jwtTokenProvider.createAccessToken(memberDTO.getMemberEmail());
            jwtTokenProvider.createRefreshToken(memberDTO.getMemberEmail());

            tokenMap.put("accessToken", accessToken);

            Cookie rememberEmailCookie = new Cookie("rememberEmail", memberDTO.getMemberEmail());
//            Cookie rememberCookie = new Cookie("remember", String.valueOf(memberDTO.isRemember()));

            rememberEmailCookie.setPath("/");
//            rememberCookie.setPath("/");

//            if (memberDTO.isRemember()) {
//                rememberEmailCookie.setMaxAge(60 * 60 * 24 * 30);
//                response.addCookie(rememberEmailCookie);
//
//                rememberCookie.setMaxAge(60 * 60 * 24 * 30);
//                response.addCookie(rememberCookie);
//            } else {
//                rememberEmailCookie.setMaxAge(0);
//                response.addCookie(rememberEmailCookie);
//
//                rememberCookie.setMaxAge(0);
//                response.addCookie(rememberCookie);
//            }
            return ResponseEntity.ok(tokenMap);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "로그인 실패: " + e.getMessage()));
        }
    }

    //    로그아웃
    @PostMapping("logout")
    public void logout(@CookieValue(value="accessToken", required = false) String token){
        String username = jwtTokenProvider.getUsername(token);
        jwtTokenProvider.deleteRefreshToken(username);
        jwtTokenProvider.addToBlacklist(token);

        Cookie deleteAccessCookie = new Cookie("accessToken", null);
        deleteAccessCookie.setPath("/");
        deleteAccessCookie.setMaxAge(0);

        response.addCookie(deleteAccessCookie);

        Cookie deleteRefreshCookie = new Cookie("refreshToken", null);
        deleteRefreshCookie.setPath("/");
        deleteRefreshCookie.setMaxAge(0);

        response.addCookie(deleteRefreshCookie);

//        회원 정보 삭제
//        redisTemplate.delete("member::" + username);

//        여러 개의 key 가져오기
//        Set keys = redisTemplate.keys("posts::post_*");
//        if(keys != null && !keys.isEmpty()) {
//            redisTemplate.delete(keys);
//        }
    }

    //    정보 가져오기
    @GetMapping("info")
    public MemberDTO getMyInfo(HttpServletRequest request){
        String token = jwtTokenProvider.parseTokenFromHeader(request);
        String memberEmail = jwtTokenProvider.getUsername(token);
        MemberDTO memberDTO = memberService.getMember(memberEmail);

        return memberDTO;
    }
}
