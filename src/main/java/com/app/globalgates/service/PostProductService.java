package com.app.globalgates.service;

import com.app.globalgates.dto.PostProductDTO;
import com.app.globalgates.repository.PostFileDAO;
import com.app.globalgates.repository.PostHashtagDAO;
import com.app.globalgates.repository.PostProductDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class PostProductService {
    private final PostProductDAO postProductDAO;
    private final PostFileDAO postFileDAO;
    private final PostHashtagDAO postHashtagDAO;

//    자신의 판매품목 목록 조회
    public List<PostProductDTO> getMyProducts(Long memberId) {
        List<PostProductDTO> products = postProductDAO.findAllByMemberId(memberId);

        products.forEach(product -> {
            product.setPostFiles(postFileDAO.findAllByPostId(product.getId()));
            product.setHashtags(postHashtagDAO.findAllByPostId(product.getId()));
        });

        return products;
    }
}
