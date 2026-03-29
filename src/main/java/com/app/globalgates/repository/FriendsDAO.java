package com.app.globalgates.repository;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.FriendsDTO;
import com.app.globalgates.mapper.FriendsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class FriendsDAO {
    private final FriendsMapper friendsMapper;

    public List<FriendsDTO> findAll(Criteria criteria, Long memberId) {
        return friendsMapper.selectAll(criteria, memberId);
    }

    public int findTotal(Long memberId) {
        return friendsMapper.selectTotal(memberId);
    }
}
