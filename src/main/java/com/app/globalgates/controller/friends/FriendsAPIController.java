package com.app.globalgates.controller.friends;

import com.app.globalgates.dto.FriendsWithPagingDTO;
import com.app.globalgates.service.FriendsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
@Slf4j
public class FriendsAPIController {
    private final FriendsService friendsService;

    @GetMapping("/list/{page}")
    public FriendsWithPagingDTO getList(@PathVariable int page, @RequestParam Long memberId) {
        log.info("친구 추천 목록 조회 — page: {}, memberId: {}", page, memberId);
        return friendsService.getList(page, memberId);
    }
}
