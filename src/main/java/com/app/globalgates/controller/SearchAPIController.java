package com.app.globalgates.controller;

import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.SearchHistoryDTO;
import com.app.globalgates.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/search")
public class SearchAPIController {
    private final SearchService searchService;

//    회원 검색 (닉네임 또는 핸들)
    @GetMapping("/members")
    public List<MemberDTO> searchMembers(@RequestParam String keyword) {
        return searchService.searchMembers(keyword);
    }

//    검색 기록 저장
    @PostMapping("/histories")
    public void saveSearchHistory(@RequestBody SearchHistoryDTO searchHistoryDTO) {
        searchService.saveSearchHistory(searchHistoryDTO);
    }

//    최근 검색 목록 조회
    @GetMapping("/histories/{memberId}")
    public List<SearchHistoryDTO> getSearchHistories(@PathVariable Long memberId) {
        return searchService.getSearchHistories(memberId);
    }

//    검색 기록 개별 삭제
    @PostMapping("/histories/{id}/delete")
    public void deleteSearchHistory(@PathVariable Long id) {
        searchService.deleteSearchHistory(id);
    }

//    검색 기록 전체 삭제
    @PostMapping("/histories/members/{memberId}/delete-all")
    public void deleteAllSearchHistories(@PathVariable Long memberId) {
        searchService.deleteAllSearchHistories(memberId);
    }
}
