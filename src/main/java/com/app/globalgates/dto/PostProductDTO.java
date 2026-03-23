package com.app.globalgates.dto;

import com.app.globalgates.domain.PostProductVO;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class PostProductDTO {
    private Long id;
    private int productPrice;
    private int productStock;
    private Long productCategoryId;
    private String createdDatetime;
    private String updatedDatetime;

    // tbl_post JOIN 정보
    private String postTitle;
    private String postContent;

    // 상품 이미지 (tbl_post_file JOIN)
    private List<PostFileDTO> postFiles = new ArrayList<>();

    // 상품 태그
    private List<PostHashtagDTO> hashtags = new ArrayList<>();

    public PostProductVO toPostProductVO() {
        return PostProductVO.builder()
                .id(id)
                .productPrice(productPrice)
                .productStock(productStock)
                .productCategoryId(productCategoryId)
                .createdDatetime(createdDatetime)
                .updatedDatetime(updatedDatetime)
                .build();
    }
}
