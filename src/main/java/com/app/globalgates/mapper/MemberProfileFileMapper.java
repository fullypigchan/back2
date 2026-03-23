package com.app.globalgates.mapper;

import com.app.globalgates.dto.MemberProfileFileDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MemberProfileFileMapper {

//    프로필 사진 추가
    public void insert(MemberProfileFileDTO memberProfileFileDTO);

//    memberId로 프로필 이미지 조회
    public MemberProfileFileDTO selectById(Long memberId);

//    프로필 이미지 삭제
    public void delete(Long Id);

//    memberId로 삭제
    public void deleteByMemberId(Long memberId);
}
