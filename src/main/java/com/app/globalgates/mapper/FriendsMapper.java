package com.app.globalgates.mapper;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.FriendsDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FriendsMapper {
    public List<FriendsDTO> selectAll(@Param("criteria") Criteria criteria, @Param("memberId") Long memberId, @Param("categoryId") Long categoryId);

    public int selectTotal(@Param("memberId") Long memberId, @Param("categoryId") Long categoryId);

    public List<FriendsDTO> selectAllFollowers(@Param("criteria") Criteria criteria, @Param("memberId") Long memberId);

    public int selectTotalFollowers(@Param("memberId") Long memberId);

    public List<FriendsDTO> selectAllFollowings(@Param("criteria") Criteria criteria, @Param("memberId") Long memberId);

    public int selectTotalFollowings(@Param("memberId") Long memberId);
}
