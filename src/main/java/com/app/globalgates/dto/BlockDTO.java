package com.app.globalgates.dto;

import com.app.globalgates.domain.BlockVO;
import lombok.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class BlockDTO {
    private Long id;
    private Long blockerId;
    private Long blockedId;
    private String createdDatetime;

    // 차단된 회원 정보
    private String memberNickname;
    private String memberHandle;

    public BlockVO toBlockVO() {
        return BlockVO.builder()
                .id(id)
                .blockerId(blockerId)
                .blockedId(blockedId)
                .createdDatetime(createdDatetime)
                .build();
    }
}
