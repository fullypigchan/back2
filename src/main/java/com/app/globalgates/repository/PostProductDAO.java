package com.app.globalgates.repository;

import com.app.globalgates.common.pagination.Criteria;
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

//    추천 상품 조회
    public List<PostProductDTO> findRecommendProducts(Criteria criteria) {
        return postProductMapper.selectRecommendProducts(criteria);
    }

//    조회된 상품 총 개수
    public int getTotal() {
        return postProductMapper.selectTotal();
    }
}
