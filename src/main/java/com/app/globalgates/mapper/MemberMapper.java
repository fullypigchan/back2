package com.app.globalgates.mapper;

import com.app.globalgates.domain.MemberVO;
import com.app.globalgates.dto.MemberDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.Optional;

@Mapper
public interface MemberMapper {
    //    회원가입
    public void insert(MemberDTO memberDTO);
    //    로그인
    public Optional<MemberDTO> selectMemberForLogin(MemberVO memberVO);
    //    이메일로 조회
    public Optional<MemberDTO> selectMemberByMemberEmail(String memberEmail);
}