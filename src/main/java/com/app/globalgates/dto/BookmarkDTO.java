package com.app.globalgates.dto;

import com.app.globalgates.domain.BookmarkVO;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class BookmarkDTO {
    private Long id;
    private Long memberId;
    private Long postId;
    private Long folderId;
    private String postTitle;
    private String postContent;
    private String createdDatetime;
    private String updatedDatetime;
    // 게시물 작성자 정보
    private Long postMemberId;
    private String memberNickname;
    private String memberHandle;
    private String memberProfileFileName;
    // 게시물 통계
    private int likeCount;
    private int replyCount;
    private int bookmarkCount;
    // 좋아요 상태
    private boolean liked;
    // 첨부파일
    private List<PostFileDTO> postFiles;

    public BookmarkVO toBookmarkVO() {
        return BookmarkVO.builder()
                .id(id)
                .memberId(memberId)
                .postId(postId)
                .folderId(folderId)
                .createdDatetime(createdDatetime)
                .updatedDatetime(updatedDatetime)
                .build();
    }
}