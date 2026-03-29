package com.app.globalgates.service;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.FriendsDTO;
import com.app.globalgates.dto.FriendsWithPagingDTO;
import com.app.globalgates.repository.FriendsDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class FriendsService {
    private final FriendsDAO friendsDAO;

    public FriendsWithPagingDTO getList(int page, Long memberId) {
        Criteria criteria = new Criteria(page, friendsDAO.findTotal(memberId));
        List<FriendsDTO> friends = friendsDAO.findAll(criteria, memberId);

        criteria.setHasMore(friends.size() > criteria.getRowCount());
        if (criteria.isHasMore()) friends.remove(friends.size() - 1);

        friends.forEach(friend -> {
            if (friend.getFollowerIntro() != null) {
                friend.setFollowerIntro(friend.getFollowerIntro() + " 님이 팔로우합니다");
            }
        });

        FriendsWithPagingDTO result = new FriendsWithPagingDTO();
        result.setFriends(friends);
        result.setCriteria(criteria);
        return result;
    }
}
