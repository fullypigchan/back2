package com.app.globalgates.mapper;

import com.app.globalgates.domain.MemberVO;
import com.app.globalgates.dto.MemberDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface MemberMapper {
    //  회원가입
    public void insert(MemberDTO memberDTO);
    //  로그인
    public Optional<MemberDTO> selectMemberForLogin(MemberVO memberVO);
    //  입력받은 이메일 혹은 핸드폰번호를 조회
    Optional<MemberDTO> selectMemberByLoginId(String loginId);
    //  이메일로 조회
    public Optional<MemberDTO> selectMemberByMemberEmail(String memberEmail);
    //  핸드폰 번호로 조회
    public Optional<MemberDTO> selectMemberByMemberPhone(String memberPhone);
    //  닉네임 또는 핸들로 회원 검색
    public List<MemberDTO> selectMembersByKeyword(String keyword);
    //  닉네임 또는 핸들로 회원 검색(팔로우 여부 포함)
    public List<MemberDTO> selectMembersByKeywordWithFollow(Long memberId, String keyword);
    //  Handle로 조회
    public Optional<MemberDTO> selectMemberByMemberHandle(String memberHandle);
    //  memberId로 조회
    public Optional<MemberDTO> selectById(Long memberId);
    //  memberId로 삭제
    public void delete(Long memberId);
    //  memberId로 soft delete
    public void softDelete(Long memberId);
    //  Handle로 조회 (간소화)
    public Optional<MemberDTO> selectMemberByHandle(String memberHandle);
    //  채팅 유저 검색 (차단 사용자 제외)
    public List<MemberDTO> searchByKeyword(@org.apache.ibatis.annotations.Param("keyword") String keyword,
                                           @org.apache.ibatis.annotations.Param("memberId") Long memberId);
}