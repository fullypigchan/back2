package com.app.globalgates.service;

import com.app.globalgates.dto.ReportDTO;
import com.app.globalgates.repository.ReportDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class ReportService {
    private final ReportDAO reportDAO;

    //    신고하기
    @CacheEvict(value = {"post:list", "page:search"}, allEntries = true)
    public void report(ReportDTO reportDTO) {
        reportDAO.save(reportDTO);
    }
}
