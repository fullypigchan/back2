package com.app.globalgates.service;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.dto.NewsBookmarkDTO;
import com.app.globalgates.repository.NewsBookmarkDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class NewsBookmarkService {
    private final NewsBookmarkDAO newsBookmarkDAO;

    @LogStatus
    @CacheEvict(value = {"news:list", "news"}, allEntries = true)
    public void addBookmark(NewsBookmarkDTO newsBookmarkDTO) {
        newsBookmarkDAO.save(newsBookmarkDTO);
    }

    @LogStatus
    @CacheEvict(value = {"news:list", "news"}, allEntries = true)
    public void deleteBookmark(Long memberId, Long newsId) {
        newsBookmarkDAO.deleteByMemberIdAndNewsId(memberId, newsId);
    }

    @LogStatusWithReturn
    public Optional<NewsBookmarkDTO> getBookmark(Long memberId, Long newsId) {
        return newsBookmarkDAO.findByMemberIdAndNewsId(memberId, newsId);
    }

    @LogStatusWithReturn
    public int getBookmarkCount(Long newsId) {
        return newsBookmarkDAO.countByNewsId(newsId);
    }
}
