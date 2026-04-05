package com.app.globalgates.controller;

import com.app.globalgates.dto.BookmarkDTO;
import com.app.globalgates.dto.BookmarkFolderDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

@Tag(name = "Bookmark", description = "Bookmark API")
public interface BookmarkRestControllerDocs {

    @Operation(
            summary = "폴더 목록 조회",
            description = "회원의 북마크 폴더 목록을 조회한다.",
            parameters = {@Parameter(name = "memberId", description = "조회할 회원의 id")}
    )
    List<BookmarkFolderDTO> getFolders(@PathVariable Long memberId);

    @Operation(
            summary = "폴더 생성",
            description = "새 북마크 폴더를 생성한다.",
            parameters = {@Parameter(name = "bookmarkFolderDTO", description = "생성할 폴더 정보 (memberId, folderName)")}
    )
    Map<String, Long> createFolder(@RequestBody BookmarkFolderDTO bookmarkFolderDTO);

    @Operation(
            summary = "폴더 수정",
            description = "북마크 폴더명을 수정한다.",
            parameters = {@Parameter(name = "bookmarkFolderDTO", description = "수정할 폴더 정보 (id, folderName)")}
    )
    void updateFolder(@RequestBody BookmarkFolderDTO bookmarkFolderDTO);

    @Operation(
            summary = "폴더 삭제",
            description = "북마크 폴더를 삭제한다. 폴더 내 북마크는 미분류로 이동된다.",
            parameters = {@Parameter(name = "id", description = "삭제할 폴더의 id")}
    )
    void deleteFolder(@PathVariable Long id);

    @Operation(
            summary = "북마크 추가",
            description = "게시물을 북마크에 추가한다.",
            parameters = {@Parameter(name = "bookmarkDTO", description = "추가할 북마크 정보 (memberId, postId, folderId)")}
    )
    void addBookmark(@RequestBody BookmarkDTO bookmarkDTO);

    @Operation(
            summary = "북마크 삭제 (id)",
            description = "북마크 id로 북마크를 삭제한다.",
            parameters = {@Parameter(name = "id", description = "삭제할 북마크의 id")}
    )
    void deleteBookmark(@PathVariable Long id);

    @Operation(
            summary = "북마크 삭제 (회원+게시물)",
            description = "회원 id와 게시물 id로 북마크를 삭제한다.",
            parameters = {
                    @Parameter(name = "memberId", description = "회원 id"),
                    @Parameter(name = "postId", description = "게시물 id")
            }
    )
    void deleteBookmarkByMemberIdAndPostId(@PathVariable Long memberId, @PathVariable Long postId);

    @Operation(
            summary = "북마크 폴더 이동",
            description = "북마크를 다른 폴더로 이동한다.",
            parameters = {
                    @Parameter(name = "id", description = "이동할 북마크의 id"),
                    @Parameter(name = "bookmarkDTO", description = "이동할 폴더 정보 (folderId)")
            }
    )
    void updateFolderId(@PathVariable Long id, @RequestBody BookmarkDTO bookmarkDTO);

    @Operation(
            summary = "회원 전체 북마크 조회",
            description = "회원의 전체 북마크 목록을 조회한다. 첨부파일 및 프로필 이미지 URL이 포함된다.",
            parameters = {@Parameter(name = "memberId", description = "조회할 회원의 id")}
    )
    List<BookmarkDTO> getBookmarks(@PathVariable Long memberId);

    @Operation(
            summary = "폴더별 북마크 조회",
            description = "특정 폴더의 북마크 목록을 조회한다.",
            parameters = {@Parameter(name = "folderId", description = "조회할 폴더의 id")}
    )
    List<BookmarkDTO> getBookmarksByFolder(@PathVariable Long folderId);

    @Operation(
            summary = "미분류 북마크 조회",
            description = "폴더에 속하지 않은 미분류 북마크 목록을 조회한다.",
            parameters = {@Parameter(name = "memberId", description = "조회할 회원의 id")}
    )
    List<BookmarkDTO> getUncategorizedBookmarks(@PathVariable Long memberId);

    @Operation(
            summary = "북마크 단건 조회 (회원+게시물)",
            description = "회원 id와 게시물 id로 북마크를 단건 조회한다.",
            parameters = {
                    @Parameter(name = "memberId", description = "회원 id"),
                    @Parameter(name = "postId", description = "게시물 id")
            }
    )
    ResponseEntity<BookmarkDTO> getBookmarkByMemberAndPost(@PathVariable Long memberId, @PathVariable Long postId);
}
