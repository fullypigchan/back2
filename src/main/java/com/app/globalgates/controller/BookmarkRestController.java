package com.app.globalgates.controller;

import com.app.globalgates.dto.BookmarkDTO;
import com.app.globalgates.dto.BookmarkFolderDTO;
import com.app.globalgates.service.BookmarkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/bookmarks")
public class BookmarkRestController {
    private final BookmarkService bookmarkService;

    @GetMapping("/folders/{memberId}")
    public List<BookmarkFolderDTO> getFolders(@PathVariable Long memberId) {
        return bookmarkService.getFolders(memberId);
    }

    @PostMapping("/folders")
    public void createFolder(@RequestBody BookmarkFolderDTO bookmarkFolderDTO) {
        bookmarkService.createFolder(bookmarkFolderDTO);
    }

    @PutMapping("/folders")
    public void updateFolder(@RequestBody BookmarkFolderDTO bookmarkFolderDTO) {
        bookmarkService.updateFolder(bookmarkFolderDTO);
    }

    @PostMapping("/folders/{id}/delete")
    public void deleteFolder(@PathVariable Long id) {
        bookmarkService.deleteFolder(id);
    }

    @PostMapping
    public void addBookmark(@RequestBody BookmarkDTO bookmarkDTO) {
        bookmarkService.addBookmark(bookmarkDTO);
    }

    @PostMapping("/{id}/delete")
    public void deleteBookmark(@PathVariable Long id) {
        bookmarkService.deleteBookmark(id);
    }

    @PostMapping("/members/{memberId}/posts/{postId}/delete")
    public void deleteBookmarkByMemberIdAndPostId(@PathVariable Long memberId, @PathVariable Long postId) {
        bookmarkService.deleteBookmark(memberId, postId);
    }

    @PutMapping("/{id}/folder")
    public void updateFolderId(@PathVariable Long id, @RequestBody BookmarkDTO bookmarkDTO) {
        bookmarkDTO.setId(id);
        bookmarkService.updateFolderId(bookmarkDTO);
    }

    @GetMapping("/members/{memberId}")
    public List<BookmarkDTO> getBookmarks(@PathVariable Long memberId) {
        return bookmarkService.getBookmarks(memberId);
    }

    @GetMapping("/folders/{folderId}/items")
    public List<BookmarkDTO> getBookmarksByFolder(@PathVariable Long folderId) {
        return bookmarkService.getBookmarksByFolder(folderId);
    }

    @GetMapping("/members/{memberId}/uncategorized")
    public List<BookmarkDTO> getUncategorizedBookmarks(@PathVariable Long memberId) {
        return bookmarkService.getUncategorizedBookmarks(memberId);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrity(DataIntegrityViolationException e) {
        log.error("데이터 무결성 위반: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "이미 북마크된 게시물입니다."));
    }
}
