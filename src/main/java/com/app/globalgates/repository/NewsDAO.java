package com.app.globalgates.repository;

import com.app.globalgates.dto.NewsDTO;
import com.app.globalgates.mapper.NewsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class NewsDAO {
    private final NewsMapper newsMapper;

    //    뉴스 전체 조회
    public List<NewsDTO> findAll() {
        return newsMapper.selectAll();
    }

    //    뉴스 단건 조회
    public Optional<NewsDTO> findById(Long id) {
        return newsMapper.selectById(id);
    }
}
