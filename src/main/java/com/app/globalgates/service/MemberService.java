package com.app.globalgates.service;

import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.common.enumeration.ProfileImageType;
import com.app.globalgates.common.exception.MemberLoginFailException;
import com.app.globalgates.common.exception.MemberNotFoundException;
import com.app.globalgates.dto.*;
import com.app.globalgates.repository.BusinessMemberDAO;
import com.app.globalgates.repository.FileDAO;
import com.app.globalgates.repository.MemberDAO;
import com.app.globalgates.repository.MemberProfileFileDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberService {
    private final MemberDAO memberDAO;
    private final MemberProfileFileDAO memberProfileFileDAO;
    private final BusinessMemberDAO businessMemberDAO;
    private final FileDAO fileDAO;
    private final PasswordEncoder passwordEncoder;

    //  회원가입
    @Transactional
    public void join(MemberDTO memberDTO, MultipartFile profile){
        memberDTO.setMemberPassword(passwordEncoder.encode(memberDTO.getMemberPassword()));
        memberDAO.save(memberDTO);
        log.info(memberDTO.toBusinessMemberVO().toString());

        BusinessMemberDTO businessMemberDTO = new BusinessMemberDTO();
        businessMemberDTO.setId(memberDTO.getId());
        businessMemberDTO.setBusinessNumber(memberDTO.getBusinessNumber());
        businessMemberDTO.setCompanyName(memberDTO.getCompanyName());
        businessMemberDTO.setCeoName(memberDTO.getCeoName());
        businessMemberDTO.setBusinessType(memberDTO.getBusinessType());
        businessMemberDAO.save(businessMemberDTO.toBusinessMemberVO());
    }
    //  프로필 이미지 저장
    @Transactional
    public void saveFile(Long memberId, MultipartFile image, String s3Key) {
        FileDTO fileDTO = new FileDTO();
        fileDTO.setOriginalName(image.getOriginalFilename());
        fileDTO.setFileName(s3Key);
        fileDTO.setFilePath(getTodayPath());
        fileDTO.setFileSize(image.getSize());
        fileDTO.setContentType(image.getContentType().contains("image") ? FileContentType.IMAGE : FileContentType.ETC);
        fileDAO.save(fileDTO);

        MemberProfileFileDTO memberProfileFileDTO = new MemberProfileFileDTO();
        memberProfileFileDTO.setId(fileDTO.getId());
        memberProfileFileDTO.setMemberId(memberId);
        memberProfileFileDTO.setProfileImageType(ProfileImageType.PROFILE);
        memberProfileFileDAO.save(memberProfileFileDTO);
    }


    //    로그인
    @Transactional
    public MemberDTO login(MemberDTO memberDTO){
        return memberDAO.findMemberForLogin(memberDTO.toMemberVO()).orElseThrow(MemberLoginFailException::new);
    }

    //    회원정보 조회
    @Cacheable(value="member", key="#loginId")
    public MemberDTO getMember(String loginId){
        return memberDAO.findMemberByLoginId(loginId).orElseThrow(MemberNotFoundException::new);
    }

    // 프로필 이미지 삭제
    public void delete(Long id) {
        MemberProfileFileDTO file = memberProfileFileDAO.findByMemberId(id);

        memberProfileFileDAO.deleteByMemberId(id);

        memberDAO.softDelete(id);
    }

    // 오늘자 경로 생성
    public String getTodayPath(){
        return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
    }


}
