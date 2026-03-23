package com.app.globalgates.mapper;

import com.app.globalgates.dto.PostProductDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PostProductMapper {
//    특정 회원의 판매품목 목록 조회
    public List<PostProductDTO> selectAllByMemberId(Long memberId);
}
