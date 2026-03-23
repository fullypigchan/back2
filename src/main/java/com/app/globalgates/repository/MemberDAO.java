package com.app.globalgates.repository;

import com.app.globalgates.domain.MemberVO;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MemberDAO {
    private final MemberMapper memberMapper;

    //  회원가입
    public void save(MemberDTO memberDTO){
        memberMapper.insert(memberDTO);
    }
    //  로그인
    public Optional<MemberDTO> findMemberForLogin(MemberVO memberVO){
        return memberMapper.selectMemberForLogin(memberVO);
    }
    //  이메일 혹은 핸드폰 조회
    public Optional<MemberDTO> findMemberByLoginId(String loginId){
        return memberMapper.selectMemberByLoginId(loginId);
    }
    //  이메일로 조회
    public Optional<MemberDTO> findMemberByMemberEmail(String memberEmail){
        return memberMapper.selectMemberByMemberEmail(memberEmail);
    }

//    닉네임 또는 핸들로 회원 검색
    public List<MemberDTO> findMembersByKeyword(String keyword) {
        return memberMapper.selectMembersByKeyword(keyword);
    }
    //  Handle로 조회
    public Optional<MemberDTO> findMemberByMemberHandle(String memberHandle){
        return memberMapper.selectMemberByMemberHandle(memberHandle);
    }
    //  memberId로 조회
    public Optional<MemberDTO> findByMemberId(Long memberId){
        return memberMapper.selectById(memberId);
    }
    //  memberId로 삭제
    public void delete(Long memberId){
        memberMapper.delete(memberId);
    }
    //  memberId로 soft delete
    public void softDelete(Long memberId){
        memberMapper.softDelete(memberId);
    }
}
