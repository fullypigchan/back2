package com.app.globalgates.domain;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString
@EqualsAndHashCode(of = "id")
@SuperBuilder
public class PostHashtagVO {
    private Long id;
    private String tagName;
    private String createdDatetime;
}
