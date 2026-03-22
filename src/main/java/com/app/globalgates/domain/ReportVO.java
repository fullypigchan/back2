package com.app.globalgates.domain;

import com.app.globalgates.common.enumeration.ReportStatus;
import com.app.globalgates.common.enumeration.ReportTargetType;
import com.app.globalgates.audit.Period;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@ToString(callSuper = true)
@EqualsAndHashCode(of = "id", callSuper = false)
@SuperBuilder
public class ReportVO extends Period {
    private Long id;
    private Long reporterId;
    private Long targetId;
    private ReportTargetType targetType;
    private String reason;
    private ReportStatus status;
}
