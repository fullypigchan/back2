package com.app.globalgates.controller;

import com.app.globalgates.dto.ReportDTO;
import com.app.globalgates.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reports")
public class ReportAPIController {
    private final ReportService reportService;

    //    게시글 신고
    @PostMapping
    public void report(@RequestBody ReportDTO reportDTO) {
        reportService.report(reportDTO);
    }
}
