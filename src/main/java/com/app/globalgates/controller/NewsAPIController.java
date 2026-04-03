package com.app.globalgates.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
// import com.app.globalgates.dto.NewsDTO;          // [n8n 연동용] 주석 해제
// import com.app.globalgates.service.NewsService;  // [n8n 연동용] 주석 해제
// import lombok.RequiredArgsConstructor;            // [n8n 연동용] 주석 해제
// import lombok.extern.slf4j.Slf4j;                // [n8n 연동용] 주석 해제
// import org.springframework.web.bind.annotation.*; // [n8n 연동용] 주석 해제

@RestController
@RequestMapping("/api/news")
// @RequiredArgsConstructor  // [n8n 연동용] 주석 해제
// @Slf4j                    // [n8n 연동용] 주석 해제
public class NewsAPIController {
    // ═══════════════════════════════════════════════════════════════
    // [n8n 연동용] 뉴스 CRUD API
    //
    // n8n 워크플로우에서 HTTP Request 노드로 호출하는 엔드포인트
    // - POST   /api/news        → 뉴스 등록 (n8n AI 요약 결과 자동 등록)
    // - PUT    /api/news/{id}   → 뉴스 수정
    // - DELETE /api/news/{id}   → 뉴스 삭제
    //
    // n8n에서 보내는 JSON 형식 예시:
    // {
    //   "adminId": 900005,
    //   "newsTitle": "제목",
    //   "newsContent": "AI 요약 내용",
    //   "newsSourceUrl": "https://원문URL",
    //   "newsCategory": "trade",        ← enum: trade, market, policy, technology, etc
    //   "newsType": "general"           ← enum: general(일반), emergency(속보)
    // }
    //
    // 활성화 순서:
    // 1) 이 파일 상단 import 주석 해제
    // 2) @RequiredArgsConstructor, @Slf4j 주석 해제
    // 3) newsService 필드 주석 해제
    // 4) 아래 엔드포인트 메서드 주석 해제
    // 5) NewsService/NewsDAO/NewsMapper 의 CUD 메서드도 주석 해제
    // ═══════════════════════════════════════════════════════════════

//    private final NewsService newsService;

    // 뉴스 등록 — n8n HTTP Request 노드에서 POST /api/news 로 호출
//    @PostMapping
//    public void saveNews(@RequestBody NewsDTO newsDTO) {
//        log.info("뉴스 등록 — title: {}, type: {}", newsDTO.getNewsTitle(), newsDTO.getNewsType());
//        newsService.saveNews(newsDTO);
//    }

    // 뉴스 수정 — 관리자 페이지에서 호출
//    @PutMapping("/{id}")
//    public void updateNews(@PathVariable Long id, @RequestBody NewsDTO newsDTO) {
//        log.info("뉴스 수정 — id: {}", id);
//        newsDTO.setId(id);
//        newsService.updateNews(newsDTO);
//    }

    // 뉴스 삭제 — 관리자 페이지에서 호출
//    @DeleteMapping("/{id}")
//    public void deleteNews(@PathVariable Long id) {
//        log.info("뉴스 삭제 — id: {}", id);
//        newsService.deleteNews(id);
//    }
}
