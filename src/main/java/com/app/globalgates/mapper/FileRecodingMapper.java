package com.app.globalgates.mapper;

import com.app.globalgates.domain.FileRecodingVO;
import com.app.globalgates.dto.FileRecodingDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface FileRecodingMapper {
    // 녹음 파일 등록
    public void insert(FileRecodingVO recodingVO);

    // 대화방 id로 파일조회
    public List<FileRecodingDTO> selectBySessionId(Long sessionId);

}
