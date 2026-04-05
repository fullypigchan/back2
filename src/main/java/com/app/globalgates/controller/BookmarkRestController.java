package com.app.globalgates.controller;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.dto.BookmarkDTO;
import com.app.globalgates.dto.BookmarkFolderDTO;
import com.app.globalgates.dto.PostFileDTO;
import com.app.globalgates.repository.PostFileDAO;
import com.app.globalgates.service.BookmarkService;
import com.app.globalgates.service.S3Service;
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

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/bookmarks")
public class BookmarkRestController implements BookmarkRestControllerDocs {
    private final BookmarkService bookmarkService;
    private final PostFileDAO postFileDAO;
    private final S3Service s3Service;

    @LogStatusWithReturn
    @GetMapping("/folders/{memberId}")
    public List<BookmarkFolderDTO> getFolders(@PathVariable Long memberId) {
        return bookmarkService.getFolders(memberId);
    }

    @LogStatusWithReturn
    @PostMapping("/folders")
    public Map<String, Long> createFolder(@RequestBody BookmarkFolderDTO bookmarkFolderDTO) {
        bookmarkService.createFolder(bookmarkFolderDTO);
        return Map.of("id", bookmarkFolderDTO.getId());
    }

    @LogStatus
    @PutMapping("/folders")
    public void updateFolder(@RequestBody BookmarkFolderDTO bookmarkFolderDTO) {
        bookmarkService.updateFolder(bookmarkFolderDTO);
    }

    @LogStatus
    @PostMapping("/folders/{id}/delete")
    public void deleteFolder(@PathVariable Long id) {
        bookmarkService.deleteFolder(id);
    }

    @LogStatus
    @PostMapping
    public void addBookmark(@RequestBody BookmarkDTO bookmarkDTO) {
        bookmarkService.addBookmark(bookmarkDTO);
    }

    @LogStatus
    @PostMapping("/{id}/delete")
    public void deleteBookmark(@PathVariable Long id) {
        bookmarkService.deleteBookmark(id);
    }

    @LogStatus
    @PostMapping("/members/{memberId}/posts/{postId}/delete")
    public void deleteBookmarkByMemberIdAndPostId(@PathVariable Long memberId, @PathVariable Long postId) {
        bookmarkService.deleteBookmark(memberId, postId);
    }

    @LogStatus
    @PutMapping("/{id}/folder")
    public void updateFolderId(@PathVariable Long id, @RequestBody BookmarkDTO bookmarkDTO) {
        bookmarkDTO.setId(id);
        bookmarkService.updateFolderId(bookmarkDTO);
    }

    @LogStatusWithReturn
    @GetMapping("/members/{memberId}")
    public List<BookmarkDTO> getBookmarks(@PathVariable Long memberId) {
        List<BookmarkDTO> bookmarks = bookmarkService.getBookmarks(memberId);
        applyPostFiles(bookmarks);
        return bookmarks;
    }

    @LogStatusWithReturn
    @GetMapping("/folders/{folderId}/items")
    public List<BookmarkDTO> getBookmarksByFolder(@PathVariable Long folderId) {
        List<BookmarkDTO> bookmarks = bookmarkService.getBookmarksByFolder(folderId);
        applyPostFiles(bookmarks);
        return bookmarks;
    }

    @LogStatusWithReturn
    @GetMapping("/members/{memberId}/uncategorized")
    public List<BookmarkDTO> getUncategorizedBookmarks(@PathVariable Long memberId) {
        List<BookmarkDTO> bookmarks = bookmarkService.getUncategorizedBookmarks(memberId);
        applyPostFiles(bookmarks);
        return bookmarks;
    }

    @LogStatusWithReturn
    @GetMapping("/members/{memberId}/posts/{postId}")
    public ResponseEntity<BookmarkDTO> getBookmarkByMemberAndPost(@PathVariable Long memberId, @PathVariable Long postId) {
        return bookmarkService.getBookmark(memberId, postId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrity(DataIntegrityViolationException e) {
        log.error("데이터 무결성 위반: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "이 폴더에 이미 북마크된 게시물입니다."));
    }

    private void applyPostFiles(List<BookmarkDTO> bookmarks) {
        bookmarks.forEach(b -> {
            List<PostFileDTO> files = postFileDAO.findAllByPostId(b.getPostId());
            b.setPostFiles(files);
            files.forEach(pf -> {
                try {
                    pf.setFilePath(s3Service.getPresignedUrl(pf.getFilePath(), Duration.ofMinutes(10)));
                } catch (IOException e) {
                    log.warn("Presigned URL 생성 실패: {}", pf.getFilePath());
                }
            });
            if (b.getMemberProfileFileName() != null) {
                try {
                    b.setMemberProfileFileName(s3Service.getPresignedUrl(b.getMemberProfileFileName(), Duration.ofMinutes(10)));
                } catch (IOException e) {
                    log.warn("프로필 Presigned URL 생성 실패: {}", b.getMemberProfileFileName());
                }
            }
        });
    }
}
