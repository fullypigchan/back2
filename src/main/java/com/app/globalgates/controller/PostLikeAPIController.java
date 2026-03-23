package com.app.globalgates.controller;

import com.app.globalgates.dto.PostLikeDTO;
import com.app.globalgates.service.PostLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/post-likes")
public class PostLikeAPIController {
    private final PostLikeService postLikeService;

//    좋아요 추가
    @PostMapping
    public void addLike(@RequestBody PostLikeDTO postLikeDTO) {
        postLikeService.addLike(postLikeDTO);
    }

//    좋아요 삭제
    @PostMapping("/members/{memberId}/posts/{postId}/delete")
    public void deleteLike(@PathVariable Long memberId, @PathVariable Long postId) {
        postLikeService.deleteLike(memberId, postId);
    }

//    좋아요 여부 조회
    @GetMapping("/members/{memberId}/posts/{postId}")
    public PostLikeDTO getLike(@PathVariable Long memberId, @PathVariable Long postId) {
        return postLikeService.getLike(memberId, postId).orElse(null);
    }

//    게시글 좋아요 수 조회
    @GetMapping("/posts/{postId}/count")
    public int getLikeCount(@PathVariable Long postId) {
        return postLikeService.getLikeCount(postId);
    }
}
