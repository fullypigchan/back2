package com.app.globalgates.controller.member;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.auth.JwtTokenProvider;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.S3Service;
import java.io.IOException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/member/**")
@RequiredArgsConstructor
@Slf4j
public class MemberAPIController {
    private final MemberService memberService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final HttpServletResponse response;
    private final S3Service s3Service;

    @PostMapping("join")
    @LogStatus
    public ResponseEntity<?> join(MemberDTO memberDTO, @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {
        log.info("memberDTO {}", memberDTO);
        if (file != null && !file.isEmpty()) {
            String todayPath = memberService.getTodayPath();
            String uploadedKeys = "";

            try {
                log.info("S3 업로드 시작");
                String s3Key = s3Service.uploadFile(file, todayPath);
                uploadedKeys = s3Key;
                log.info("S3업로드 성공 : {}", uploadedKeys );
                log.info("회원저장 시작");
                memberService.join(memberDTO, file);
                log.info("회원 저장성공");
                log.info("파일 정보 저장");
                memberService.saveFile(memberDTO.getId(), file, s3Key);
                log.info("파일 정보 저장 성공");
            } catch (Exception e) {
                log.error("회원가입 파일 처리 실패. uploadedKey=[{}], memberId=[{}]",
                        uploadedKeys, memberDTO.getId(), e);
                s3Service.deleteFile(uploadedKeys);
                memberService.delete(memberDTO.getId());
                throw new RuntimeException("파일 업로드 실패", e);
            }

        } else {
            memberService.join(memberDTO, null);
        }
        return ResponseEntity.ok(Map.of("message", "회원가입 성공"));
    }


    @PostMapping("login")
    public ResponseEntity<?> login(@RequestBody MemberDTO memberDTO){
        log.info("memberDTO: {}", memberDTO);
        try{
            Map<String, String> tokenMap = new HashMap<>();

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(memberDTO.getLoginId(),memberDTO.getMemberPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.info("authentication: {}", (CustomUserDetails) authentication.getPrincipal());

            String accessToken = jwtTokenProvider.createAccessToken(memberDTO.getLoginId());
            jwtTokenProvider.createRefreshToken(memberDTO.getLoginId());

            tokenMap.put("accessToken", accessToken);

            Cookie rememberLoginIdCookie = new Cookie("rememberLoginId", memberDTO.getLoginId());

            rememberLoginIdCookie.setPath("/");
            rememberLoginIdCookie.setMaxAge(60 * 60 * 24 * 30);
            response.addCookie(rememberLoginIdCookie);

            return ResponseEntity.ok(tokenMap);
        }catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "로그인실패 : " + e.getMessage()));
        }
    }
}
