package com.app.globalgates.repository;

import com.app.globalgates.dto.PostProductDTO;
import com.app.globalgates.mapper.PostProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PostProductDAO {
    private final PostProductMapper postProductMapper;

//    특정 회원의 판매품목 목록 조회
    public List<PostProductDTO> findAllByMemberId(Long memberId) {
        return postProductMapper.selectAllByMemberId(memberId);
    }
}
