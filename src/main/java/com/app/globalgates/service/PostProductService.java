package com.app.globalgates.service;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.PostFileDTO;
import com.app.globalgates.dto.PostProductDTO;
import com.app.globalgates.dto.PostProductWithPagingDTO;
import com.app.globalgates.repository.PostFileDAO;
import com.app.globalgates.repository.PostHashtagDAO;
import com.app.globalgates.repository.PostProductDAO;
import com.app.globalgates.util.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
            product.setPostFiles(postFileDAO.findAllByPostId(product.getId())
                            .stream()
                            .map(PostFileDTO::getFilePath)
                            .collect(Collectors.toList())
            );
            product.setHashtags(postHashtagDAO.findAllByPostId(product.getId()));
        });

        return products;
    }

//    추천 상품 목록 조회
    public PostProductWithPagingDTO getRecommendProducts(int page) {
        PostProductWithPagingDTO postProductWithPagingDTO = new PostProductWithPagingDTO();
        Criteria criteria = new Criteria(page, postProductDAO.getTotal());

        List<PostProductDTO> products = postProductDAO.findRecommendProducts(criteria).stream()
                .map(productDTO -> {
                    List<PostFileDTO> images = new ArrayList<>(postFileDAO.findAllByPostId(productDTO.getId()));
                    if(!images.isEmpty()) {
                        productDTO.setPostFiles(
                                images.stream()
                                        .map(PostFileDTO::getFilePath)
                                        .collect(Collectors.toList())
                        );
                    }
                    return productDTO;
                }).collect(Collectors.toList());

        criteria.setHasMore(products.size() > criteria.getRowCount());
        postProductWithPagingDTO.setCriteria(criteria);

        if(criteria.isHasMore()) {
            products.remove(products.size() - 1);
        }

        products.forEach(product -> {
            product.setCreatedDatetime(DateUtils.toRelativeTime(product.getCreatedDatetime()));
        });
        postProductWithPagingDTO.setPosts(products);

        return postProductWithPagingDTO;
    }
}
