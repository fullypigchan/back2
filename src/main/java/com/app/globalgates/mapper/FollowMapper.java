package com.app.globalgates.mapper;

import com.app.globalgates.dto.FollowDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface FollowMapper {
    //    팔로우 추가
    public void insert(FollowDTO followDTO);

    //    팔로우 삭제
    public void delete(@Param("followerId") Long followerId, @Param("followingId") Long followingId);

    //    팔로우 여부 조회
    public Optional<FollowDTO> selectByFollowerIdAndFollowingId(@Param("followerId") Long followerId, @Param("followingId") Long followingId);

    //    팔로워 목록 (나를 팔로우한 사람들)
    public List<FollowDTO> selectAllFollowers(Long followingId);

    //    팔로잉 목록 (내가 팔로우한 사람들)
    public List<FollowDTO> selectAllFollowings(Long followerId);

}
