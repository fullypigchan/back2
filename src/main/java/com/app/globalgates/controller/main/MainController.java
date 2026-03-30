package com.app.globalgates.controller.main;

import com.app.globalgates.auth.JwtTokenProvider;
import com.app.globalgates.dto.BlockDTO;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.MemberProfileFileDTO;
import com.app.globalgates.dto.PostDTO;
import com.app.globalgates.dto.ReportDTO;
import com.app.globalgates.service.BlockService;
import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.PostService;
import com.app.globalgates.service.ReportService;
import com.app.globalgates.service.S3Service;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

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
    private final BlockService blockService;
    private final ReportService reportService;

//    메인 페이지
    @GetMapping("/main")
    public String goToMain(HttpServletRequest request, Model model) {
        String token = jwtTokenProvider.parseTokenFromHeader(request);
        String loginId = jwtTokenProvider.getUsername(token);
        MemberDTO member = memberService.getMember(loginId);

        // 프로필 이미지를 별도 조회 (Redis 캐시된 member에는 파일 정보가 없을 수 있음)
        MemberProfileFileDTO profileFile = memberService.getProfileFile(member.getId());
        if (profileFile != null && profileFile.getFileName() != null) {
            try {
                member.setFileName(s3Service.getPresignedUrl(profileFile.getFileName(), Duration.ofMinutes(10)));
            } catch (IOException e) {
                member.setFileName(null);
            }
        }

        model.addAttribute("member", member);
        return "main/main";
    }

//    게시글 상세 페이지
    @GetMapping("/post/detail/{id}")
    public String goToPostDetail(@PathVariable Long id, @RequestParam(required = false) Long memberId, HttpServletRequest request, Model model) {
        if (memberId == null) {
            try {
                String token = jwtTokenProvider.parseTokenFromHeader(request);
                String username = jwtTokenProvider.getUsername(token);
                memberId = memberService.getMember(username).getId();
            } catch (Exception e) {
                memberId = 0L;
            }
        }
        PostDTO postDTO = postService.getDetail(id, memberId);
        postDTO.getPostFiles().forEach(pf -> {
            try {
                pf.setFilePath(s3Service.getPresignedUrl(pf.getFilePath(), Duration.ofMinutes(10)));
            } catch (IOException e) {
                throw new RuntimeException("Presigned URL 생성 실패", e);
            }
        });

        String token = jwtTokenProvider.parseTokenFromHeader(request);
        String loginId = jwtTokenProvider.getUsername(token);
        MemberDTO loginMember = memberService.getMember(loginId);
        MemberProfileFileDTO loginProfileFile = memberService.getProfileFile(loginMember.getId());
        if (loginProfileFile != null && loginProfileFile.getFileName() != null) {
            try {
                loginMember.setFileName(s3Service.getPresignedUrl(loginProfileFile.getFileName(), Duration.ofMinutes(10)));
            } catch (IOException e) {
                loginMember.setFileName(null);
            }
        }

        model.addAttribute("post", postDTO);
        model.addAttribute("memberId", memberId);
        model.addAttribute("loginMember", loginMember);
        return "post-detailed/post-detailed";
    }

//    상세에서 차단하면 메인으로
    @PostMapping("/post/detail/block")
    public RedirectView blockFromDetail(BlockDTO blockDTO) {
        blockService.block(blockDTO);
        return new RedirectView("/main/main");
    }

//    상세에서 신고하면 메인으로
    @PostMapping("/post/detail/report")
    public RedirectView reportFromDetail(ReportDTO reportDTO) {
        reportService.report(reportDTO);
        return new RedirectView("/main/main");
    }

//    상세에서 삭제하면 메인으로
    @PostMapping("/post/detail/delete/{id}")
    public RedirectView deleteFromDetail(@PathVariable Long id) {
        postService.delete(id);
        return new RedirectView("/main/main");
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
