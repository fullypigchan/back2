package com.app.globalgates.service;

import com.app.globalgates.dto.FollowDTO;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.repository.FollowDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class FollowService {
    private final FollowDAO followDAO;

    //    팔로우 추가
    @CacheEvict(value = {"member", "post", "post:list"}, allEntries = true)
    public void follow(FollowDTO followDTO) {
        if (followDAO.findByFollowerIdAndFollowingId(followDTO.getFollowerId(), followDTO.getFollowingId()).isPresent()) {
            return;
        }
        followDAO.save(followDTO);
    }

    //    팔로우 해제
    @CacheEvict(value = {"member", "post", "post:list"}, allEntries = true)
    public void unfollow(Long followerId, Long followingId) {
        followDAO.delete(followerId, followingId);
    }

    //    팔로우 여부 조회
    public Optional<FollowDTO> checkFollow(Long followerId, Long followingId) {
        return followDAO.findByFollowerIdAndFollowingId(followerId, followingId);
    }

    //    팔로워 목록 (나를 팔로우한 사람들)
    public List<FollowDTO> getFollowers(Long followingId) {
        return followDAO.findAllFollowers(followingId);
    }

    //    팔로잉 목록 (내가 팔로우한 사람들)
    public List<FollowDTO> getFollowings(Long followerId) {
        return followDAO.findAllFollowings(followerId);
    }

    //    팔로우하면 좋을 회원 3명 (팔로우 추천)
    public List<MemberDTO> getUnfollowedMembers(Long memberId) {
        return followDAO.findUnfollowedMembers(memberId);
    }
}
