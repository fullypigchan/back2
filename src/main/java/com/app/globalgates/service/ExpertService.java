package com.app.globalgates.service;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.ExpertDTO;
import com.app.globalgates.dto.ExpertWithPagingDTO;
import com.app.globalgates.repository.ExpertDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class ExpertService {
    private final ExpertDAO expertDAO;

    //    전문가 목록 조회
    public ExpertWithPagingDTO getList(int page, Long memberId) {
        Criteria criteria = new Criteria(page, expertDAO.findTotal());
        List<ExpertDTO> experts = expertDAO.findAll(criteria, memberId);

        criteria.setHasMore(experts.size() > criteria.getRowCount());
        if (criteria.isHasMore()) experts.remove(experts.size() - 1);

        experts.forEach(expert -> {
            if (expert.getFollowerIntro() != null) {
                expert.setFollowerIntro(expert.getFollowerIntro() + " 님이 팔로우합니다");
            }
        });

        ExpertWithPagingDTO expertWithPagingDTO = new ExpertWithPagingDTO();
        expertWithPagingDTO.setExperts(experts);
        expertWithPagingDTO.setCriteria(criteria);
        return expertWithPagingDTO;
    }
}