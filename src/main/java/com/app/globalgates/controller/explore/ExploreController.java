package com.app.globalgates.controller.explore;

import com.app.globalgates.dto.NewsDTO;
import com.app.globalgates.dto.PostProductDTO;
import com.app.globalgates.dto.PostProductWithPagingDTO;
import com.app.globalgates.service.NewsService;
import com.app.globalgates.service.PostProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/explore/**")
@Slf4j
public class ExploreController {
    private final PostProductService postProductService;
    private final NewsService newsService;

//    추천 상품 목록 조회
    @GetMapping("products/{page}")
    public PostProductWithPagingDTO getRecommends(@PathVariable int page) {
        return postProductService.getRecommendProducts(page);
    }

//    뉴스 목록 조회
    @GetMapping("news")
    public List<NewsDTO> getNews() {
        return newsService.getNewsList();
    }

//    실시간 검색어 순위 조회

}
