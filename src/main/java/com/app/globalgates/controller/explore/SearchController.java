package com.app.globalgates.controller.explore;

import com.app.globalgates.dto.PostWithPagingDTO;
import com.app.globalgates.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/explore/**")
@Slf4j
public class SearchController {
    private PostService postService;

    @GetMapping("search/{page}")
    public PostWithPagingDTO getPopularPosts() {
        return null;
    }

}
