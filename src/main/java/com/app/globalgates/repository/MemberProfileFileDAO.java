package com.app.globalgates.repository;

import com.app.globalgates.dto.MemberProfileFileDTO;
import com.app.globalgates.mapper.MemberProfileFileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class MemberProfileFileDAO {
    private final MemberProfileFileMapper memberProfileFileMapper;

    //    사진추가
    public void save(MemberProfileFileDTO memberProfileFileDTO) {
        memberProfileFileMapper.insert(memberProfileFileDTO);
    }
    //    memberId로 프로필 이미지 조회
    public MemberProfileFileDTO findByMemberId(Long memberId) {
       return memberProfileFileMapper.selectById(memberId);
    }

    //  프로필 이미지 삭제
    public void delete(Long Id) {
        memberProfileFileMapper.delete(Id);
    }

    //  memberId로 이미지 삭제
    public void deleteByMemberId(Long memberId) {
        memberProfileFileMapper.deleteByMemberId(memberId);
    }
}
