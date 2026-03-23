package com.app.globalgates.controller;

import com.app.globalgates.dto.NewsDTO;
import com.app.globalgates.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/news")
public class NewsAPIController {
    private final NewsService newsService;

//    메인 사이드바용 최신 뉴스 2개 조회
    @GetMapping("/latest")
    public List<NewsDTO> getLatestNewsInMain() {
        return newsService.getLatestNewsInMain();
    }
}
