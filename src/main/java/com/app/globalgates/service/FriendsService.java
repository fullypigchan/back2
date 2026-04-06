package com.app.globalgates.service;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.FriendsDTO;
import com.app.globalgates.dto.FriendsWithPagingDTO;
import com.app.globalgates.repository.FriendsDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class FriendsService {
    private final FriendsDAO friendsDAO;
    private final S3Service s3Service;

    public FriendsWithPagingDTO getList(int page, Long memberId, Long categoryId) {
        log.info("들어옴1 getList, page: {}, memberId: {}, categoryId: {}", page, memberId, categoryId);
        Criteria criteria = new Criteria(page, friendsDAO.findTotal(memberId, categoryId));
        List<FriendsDTO> friends = friendsDAO.findAll(criteria, memberId, categoryId);

        criteria.setHasMore(friends.size() > criteria.getRowCount());
        if (criteria.isHasMore()) friends.remove(friends.size() - 1);

        friends.forEach(friend -> {
            if (friend.getFollowerIntro() != null) {
                friend.setFollowerIntro(friend.getFollowerIntro() + " 님이 팔로우합니다");
            }
            // 프로필 이미지 presigned URL 변환
            if (friend.getMemberProfileFileName() != null
                    && !friend.getMemberProfileFileName().startsWith("http")
                    && !friend.getMemberProfileFileName().startsWith("/uploads/")) {
                try {
                    log.info("들어옴2 presigned URL 변환, filePath: {}", friend.getMemberProfileFileName());
                    friend.setMemberProfileFileName(
                            s3Service.getPresignedUrl(friend.getMemberProfileFileName(), Duration.ofMinutes(10)));
                } catch (IOException e) {
                    log.error("프로필 Presigned URL 생성 실패: {}", friend.getMemberProfileFileName(), e);
                    friend.setMemberProfileFileName(null);
                }
            }
        });

        FriendsWithPagingDTO result = new FriendsWithPagingDTO();
        result.setFriends(friends);
        result.setCriteria(criteria);
        return result;
    }
}
