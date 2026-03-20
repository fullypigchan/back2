package com.app.globalgates.repository;

import com.app.globalgates.domain.MemberVO;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MemberDAO {
    private final MemberMapper memberMapper;

    //    회원가입
    public void save(MemberDTO memberDTO){
        memberMapper.insert(memberDTO);
    }
    //    로그인
    public Optional<MemberDTO> findMemberForLogin(MemberVO memberVO){
        return memberMapper.selectMemberForLogin(memberVO);
    }
    //    이메일로 조회
    public Optional<MemberDTO> findMemberByMemberEmail(String memberEmail){
        return memberMapper.selectMemberByMemberEmail(memberEmail);
    }
}
