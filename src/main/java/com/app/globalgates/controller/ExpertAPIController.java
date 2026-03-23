package com.app.globalgates.controller;

import com.app.globalgates.dto.ExpertDTO;
import com.app.globalgates.service.ExpertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/experts")
@Slf4j
public class ExpertAPIController {
    private final ExpertService expertService;

    //    전문가 목록 조회
    @GetMapping("/list/{page}")
    public List<ExpertDTO> getList(@PathVariable int page, @RequestParam Long memberId) {
        return expertService.getList(page, memberId);
    }
}
