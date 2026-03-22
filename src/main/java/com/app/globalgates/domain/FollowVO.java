package com.app.globalgates.domain;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString
@EqualsAndHashCode(of = "id")
@SuperBuilder
public class FollowVO {
    private Long id;
    private Long followerId;
    private Long followingId;
    private String createdDatetime;
}
