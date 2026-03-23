package com.app.globalgates.service;

import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.SearchHistoryDTO;
import com.app.globalgates.repository.MemberDAO;
import com.app.globalgates.repository.SearchHistoryDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class SearchService {
    private final SearchHistoryDAO searchHistoryDAO;
    private final MemberDAO memberDAO;

//    검색 기록 저장 (중복이면 횟수 증가, 없으면 새로 저장)
    public void saveSearchHistory(SearchHistoryDTO searchHistoryDTO) {
        searchHistoryDAO.findByMemberIdAndKeyword(searchHistoryDTO.getMemberId(), searchHistoryDTO.getSearchKeyword())
                .ifPresentOrElse(
                        existing -> searchHistoryDAO.updateSearchCount(searchHistoryDTO.getMemberId(), searchHistoryDTO.getSearchKeyword()),
                        () -> searchHistoryDAO.save(searchHistoryDTO)
                );
    }

//    최근 검색 목록 조회
    public List<SearchHistoryDTO> getSearchHistories(Long memberId) {
        return searchHistoryDAO.findAllByMemberId(memberId);
    }

//    검색 기록 개별 삭제
    public void deleteSearchHistory(Long id) {
        searchHistoryDAO.delete(id);
    }

//    검색 기록 전체 삭제
    public void deleteAllSearchHistories(Long memberId) {
        searchHistoryDAO.deleteAllByMemberId(memberId);
    }

//    회원 검색 (닉네임 또는 핸들)
    public List<MemberDTO> searchMembers(String keyword) {
        return memberDAO.findMembersByKeyword(keyword);
    }
}
