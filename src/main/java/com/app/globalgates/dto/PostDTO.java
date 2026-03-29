
package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.Status;
import com.app.globalgates.domain.PostVO;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class PostDTO {
    private Long id;
    private Long memberId;
    private Status postStatus;
    private String postTitle;
    private String postContent;
    private String location;
    private Long replyPostId;
    private String createdDatetime;
    private String updatedDatetime;

    // 멤버
    private String memberNickname;
    private String memberHandle;
    private String memberProfileFileName;
    private String badgeType;

    // 좋아요,댓글,북마크 개수
    private int likeCount;
    private int replyCount;
    private int bookmarkCount;

    // 좋아요, 북마크 여부
    private boolean isLiked;
    private boolean isBookmarked;

    // 해시태그
    private List<PostHashtagDTO> hashtags = new ArrayList<>();

    // 첨부파일
    private List<PostFileDTO> postFiles;
    private List<String> fileUrls;
    private String[] fileIdsToDelete;

    // 커뮤니티
    private Long communityId;
    private String communityName;
    private String categoryName;

    // 대댓글 (댓글의 댓글)
    private List<PostDTO> subReplies;

    public PostVO toPostVO() {
        return PostVO.builder()
                .id(id)
                .memberId(memberId)
                .postStatus(postStatus)
                .postTitle(postTitle)
                .postContent(postContent)
                .location(location)
                .replyPostId(replyPostId)
                .createdDatetime(createdDatetime)
                .updatedDatetime(updatedDatetime)
                .build();
    }
}
