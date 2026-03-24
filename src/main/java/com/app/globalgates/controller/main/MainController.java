package com.app.globalgates.controller.main;

import com.app.globalgates.auth.JwtTokenProvider;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.PostDTO;
import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.PostService;
import com.app.globalgates.service.S3Service;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/main")
@RequiredArgsConstructor
public class MainController {
    private final PostService postService;
    private final S3Service s3Service;
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberService memberService;

//    메인 페이지
    @GetMapping("/main")
    public String goToMain(HttpServletRequest request, Model model) {
        String token = jwtTokenProvider.parseTokenFromHeader(request);
        String loginId = jwtTokenProvider.getUsername(token);
        MemberDTO member = memberService.getMember(loginId);

        if (member.getFileName() != null && !member.getFileName().isEmpty()) {
            try {
                member.setFileName(s3Service.getPresignedUrl(member.getFileName(), Duration.ofMinutes(10)));
            } catch (IOException e) {
                member.setFileName(null);
            }
        }

        model.addAttribute("member", member);
        return "main/main";
    }

//    게시글 상세 페이지
    @GetMapping("/post/detail/{id}")
    public String goToPostDetail(@PathVariable Long id, @RequestParam Long memberId, Model model) {
        PostDTO postDTO = postService.getDetail(id, memberId);
        postDTO.getPostFiles().forEach(pf -> {
            try {
                pf.setFilePath(s3Service.getPresignedUrl(pf.getFilePath(), Duration.ofMinutes(10)));
            } catch (IOException e) {
                throw new RuntimeException("Presigned URL 생성 실패", e);
            }
        });
        model.addAttribute("post", postDTO);
        return "post-detailed/post-detailed";
    }

//    S3 Presigned URL 변환
    private List<String> convertToPresignedUrl(List<String> s3Keys) {
        if (s3Keys == null || s3Keys.isEmpty()) return List.of();
        return s3Keys.stream()
                .map(key -> {
                    try {
                        return s3Service.getPresignedUrl(key, Duration.ofMinutes(10));
                    } catch (IOException e) {
                        throw new RuntimeException("Presigned URL 생성 실패", e);
                    }
                })
                .collect(Collectors.toList());
    }
}
