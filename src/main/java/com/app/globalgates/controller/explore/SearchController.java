package com.app.globalgates.controller.explore;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.common.search.PostSearch;
import com.app.globalgates.dto.MemberWithPagingDTO;
import com.app.globalgates.dto.PostWithPagingDTO;
import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.PostService;
import com.app.globalgates.service.S3Service;
import com.app.globalgates.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/explore/**")
@Slf4j
public class SearchController {
    private final PostService postService;
    private final MemberService memberService;
    private final S3Service s3service;

    // search 값의 type이 'popular'이면 인기순, 그 외는 최신순으로 조회
    @GetMapping("search/{page}")
    public ResponseEntity<?> getSearchPosts(@PathVariable int page, PostSearch search,
                                            @AuthenticationPrincipal CustomUserDetails userDetails) {
        search.setMemberId(userDetails.getId());
        PostWithPagingDTO postWithPagingDTO = postService.getListBySearch(page, search);

        postWithPagingDTO.getPosts().forEach(post -> {
            post.setPostFiles(convertToPresignedUrl(post.getPostFiles()));
        });

        return ResponseEntity.ok(postWithPagingDTO);
    }

    @GetMapping("search/member/{page}")
    public ResponseEntity<?> getSearchMembers(@PathVariable int page, String keyword) {
        MemberWithPagingDTO memberWithPagingDTO = memberService.getSearchMember(page, keyword);
        return ResponseEntity.ok(memberWithPagingDTO);
    }


    // 이미지 경로 변환 공통 로직
    private List<String> convertToPresignedUrl(List<String> s3Keys) {
        if (s3Keys == null || s3Keys.isEmpty()) return List.of();
        return s3Keys.stream()
                .map(key -> {
                    try {
                        return s3service.getPresignedUrl(key, Duration.ofMinutes(10));
                    } catch (IOException e) {
                        throw new RuntimeException("Presigned URL 생성 실패", e);
                    }
                })
                .collect(Collectors.toList());
    }
}
