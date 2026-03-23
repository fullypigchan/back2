package com.app.globalgates.mapper;

import com.app.globalgates.dto.ReportDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface ReportMapper {
    //    신고하기
    public void insert(ReportDTO reportDTO);

}
