package com.app.globalgates.dto;

import com.app.globalgates.domain.CommunityVO;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class CommunityDTO implements Serializable {

    private Long id;
    private Long creatorId;
    private String communityName;
    private String description;
    private String communityStatus;
    private Long categoryId;
    private String categoryName;
    private int memberCount;
    private int postCount;
    private String coverFilePath;
    private String createdDatetime;
    private String updatedDatetime;
    private boolean isJoined;
    private String myRole;

    public CommunityVO toCommunityVO() {
        return CommunityVO.builder()
                .id(id)
                .creatorId(creatorId)
                .communityName(communityName)
                .description(description)
                .communityStatus(communityStatus)
                .categoryId(categoryId)
                .build();
    }
}
