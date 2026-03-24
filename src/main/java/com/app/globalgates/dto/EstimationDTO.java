package com.app.globalgates.dto;

import com.app.globalgates.common.enumeration.Status;
import lombok.*;

@Getter @Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstimationDTO {
    private Long id;
    private Long requesterId;
    private Long receiverId;
    private Long productId;
    private String title;
    private String content;
    private String deadLine;
    private Status status;
    private String createdDateTime;
    private String updatedDateTime;
}
