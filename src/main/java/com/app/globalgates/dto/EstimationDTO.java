package com.app.globalgates.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
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
    private String location;
    private String deadLine;
    private String status;
    private String requesterEmail;
    private String receiverEmail;
    private String createdDateTime;
    private String updatedDateTime;
    @Builder.Default
    private List<EstimationTagDTO> tags = new ArrayList<>();
}
