package com.app.globalgates.service;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.dto.BookmarkDTO;
import com.app.globalgates.dto.BookmarkFolderDTO;
import com.app.globalgates.repository.BookmarkDAO;
import com.app.globalgates.repository.BookmarkFolderDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookmarkService {
    private final BookmarkDAO bookmarkDAO;
    private final BookmarkFolderDAO bookmarkFolderDAO;

    //    폴더 생성
    @CacheEvict(value = "bookmark:folder:list", allEntries = true)
    @LogStatus
    public void createFolder(BookmarkFolderDTO bookmarkFolderDTO) {
        bookmarkFolderDAO.save(bookmarkFolderDTO);
    }

    //    폴더 수정
    @CacheEvict(value = "bookmark:folder:list", allEntries = true)
    public void updateFolder(BookmarkFolderDTO bookmarkFolderDTO) {
        bookmarkFolderDAO.update(bookmarkFolderDTO);
    }

    //    폴더 삭제
    @CacheEvict(value = {"bookmark:folder:list", "bookmark:list"}, allEntries = true)
    @LogStatus
    public void deleteFolder(Long id) {
        bookmarkDAO.clearFolderId(id);
        bookmarkFolderDAO.delete(id);
    }

    //    폴더 단건 조회
    public Optional<BookmarkFolderDTO> getFolder(Long id) {
        return bookmarkFolderDAO.findById(id);
    }

    //    폴더 목록 조회
    @Cacheable(value = "bookmark:folder:list", key = "#memberId")
    @LogStatusWithReturn
    public List<BookmarkFolderDTO> getFolders(Long memberId) {
        return bookmarkFolderDAO.findAllByMemberId(memberId);
    }

    //    북마크 추가
    @CacheEvict(value = {"bookmark:list", "post:list", "post"}, allEntries = true)
    @LogStatus
    public void addBookmark(BookmarkDTO bookmarkDTO) {
        bookmarkDAO.save(bookmarkDTO);
    }

    //    북마크 삭제
    @CacheEvict(value = {"bookmark:list", "post:list", "post"}, allEntries = true)
    @LogStatus
    public void deleteBookmark(Long id) {
        bookmarkDAO.delete(id);
    }

    //    회원/게시글 기준 북마크 삭제
    @CacheEvict(value = {"bookmark:list", "post:list", "post"}, allEntries = true)
    @LogStatus
    public void deleteBookmark(Long memberId, Long postId) {
        bookmarkDAO.deleteByMemberIdAndPostId(memberId, postId);
    }

    //    북마크 폴더 이동
    @CacheEvict(value = "bookmark:list", allEntries = true)
    public void updateFolderId(BookmarkDTO bookmarkDTO) {
        bookmarkDAO.updateFolderId(bookmarkDTO);
    }

    //    북마크 단건 조회
    public Optional<BookmarkDTO> getBookmark(Long id) {
        return bookmarkDAO.findById(id);
    }

    //    회원/게시글 기준 북마크 단건 조회
    public Optional<BookmarkDTO> getBookmark(Long memberId, Long postId) {
        return bookmarkDAO.findByMemberIdAndPostId(memberId, postId);
    }

    //    회원 전체 북마크 조회
    @Cacheable(value = "bookmark:list", key = "'member:' + #memberId")
    @LogStatusWithReturn
    public List<BookmarkDTO> getBookmarks(Long memberId) {
        return bookmarkDAO.findAllByMemberId(memberId);
    }

    //    폴더별 북마크 조회
    @Cacheable(value = "bookmark:list", key = "'folder:' + #folderId")
    @LogStatusWithReturn
    public List<BookmarkDTO> getBookmarksByFolder(Long folderId) {
        return bookmarkDAO.findAllByFolderId(folderId);
    }

    //    미분류 북마크 조회
    @Cacheable(value = "bookmark:list", key = "'uncategorized:' + #memberId")
    @LogStatusWithReturn
    public List<BookmarkDTO> getUncategorizedBookmarks(Long memberId) {
        return bookmarkDAO.findAllUncategorizedByMemberId(memberId);
    }

    //    북마크 개수 조회
    public int getBookmarkCount(Long memberId) {
        return bookmarkDAO.countByMemberId(memberId);
    }
}
