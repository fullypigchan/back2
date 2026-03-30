package com.app.globalgates.repository;

import com.app.globalgates.domain.FileRecodingVO;
import com.app.globalgates.dto.FileRecodingDTO;
import com.app.globalgates.mapper.FileRecodingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class FileRecodingDAO {
    private final FileRecodingMapper fileRecodingMapper;

    // 녹음 파일 등록
    public void save(FileRecodingVO fileRecodingVO) {
        fileRecodingMapper.insert(fileRecodingVO);
    };

    // 대화방 id로 녹음파일 조회
    public List<FileRecodingDTO> findBySessionId(Long sessionId) {
        return fileRecodingMapper.selectBySessionId(sessionId);
    }
}
