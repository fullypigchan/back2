package com.app.globalgates.domain;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString
@EqualsAndHashCode(of = "id")
@SuperBuilder
public class PostHashtagRelVO {
    private Long id;
    private Long postId;
    private Long hashtagId;
}
