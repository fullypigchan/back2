package com.app.globalgates.controller;

import com.app.globalgates.dto.FollowDTO;
import com.app.globalgates.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/follows")
public class FollowAPIController {
    private final FollowService followService;

    //    팔로우 추가
    @PostMapping
    public void follow(@RequestBody FollowDTO followDTO) {
        followService.follow(followDTO);
    }

    //    팔로우 해제
    @PostMapping("/{followerId}/{followingId}/delete")
    public void unfollow(@PathVariable Long followerId, @PathVariable Long followingId) {
        followService.unfollow(followerId, followingId);
    }

    //    팔로우 여부 조회
    @GetMapping("/{followerId}/{followingId}")
    public boolean isFollowing(@PathVariable Long followerId, @PathVariable Long followingId) {
        return followService.checkFollow(followerId, followingId).isPresent();
    }
}
