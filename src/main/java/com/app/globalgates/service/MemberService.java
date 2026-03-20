package com.app.globalgates.service;

import com.app.globalgates.common.exception.MemberLoginFailException;
import com.app.globalgates.common.exception.MemberNotFoundException;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.repository.MemberDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberDAO memberDAO;
    private final PasswordEncoder passwordEncoder;

    //    회원가입
    public void join(MemberDTO memberDTO){
        memberDTO.setMemberPassword(passwordEncoder.encode(memberDTO.getMemberPassword()));
        memberDAO.save(memberDTO);
    }

    //    로그인
    public MemberDTO login(MemberDTO memberDTO){
        return memberDAO.findMemberForLogin(memberDTO.toMemberVO()).orElseThrow(MemberLoginFailException::new);
    }

    //    회원정보 조회
    @Cacheable(value="member", key="#memberEmail")
    public MemberDTO getMember(String memberEmail){
        return memberDAO.findMemberByMemberEmail(memberEmail).orElseThrow(MemberNotFoundException::new);
    }
}
