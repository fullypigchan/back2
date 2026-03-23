package com.app.globalgates.domain;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString
@EqualsAndHashCode(of = "id")
@SuperBuilder
public class BlockVO {
    private Long id;
    private Long blockerId;
    private Long blockedId;
    private String createdDatetime;
}
