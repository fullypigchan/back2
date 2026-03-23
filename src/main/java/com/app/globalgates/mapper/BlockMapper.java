package com.app.globalgates.mapper;

import com.app.globalgates.dto.BlockDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface BlockMapper {
    //    차단 추가
    public void insert(BlockDTO blockDTO);

    //    차단 해제
    public void delete(@Param("blockerId") Long blockerId, @Param("blockedId") Long blockedId);

    //    차단 여부 조회
    public Optional<BlockDTO> selectByBlockerIdAndBlockedId(@Param("blockerId") Long blockerId, @Param("blockedId") Long blockedId);

    //    차단 목록 조회
    public List<BlockDTO> selectAllByBlockerId(Long blockerId);
}
