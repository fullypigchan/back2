package com.app.globalgates.repository;

import com.app.globalgates.dto.ReportDTO;
import com.app.globalgates.mapper.ReportMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ReportDAO {
    private final ReportMapper reportMapper;

    //    신고하기
    public void save(ReportDTO reportDTO) {
        reportMapper.insert(reportDTO);
    }

}
