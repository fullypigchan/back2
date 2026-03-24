package com.app.globalgates.service;

import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.common.enumeration.ProfileImageType;
import com.app.globalgates.common.exception.MemberLoginFailException;
import com.app.globalgates.common.exception.MemberNotFoundException;
import com.app.globalgates.dto.*;
import com.app.globalgates.repository.*;
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
    private final CategoryMemberDAO categoryMemberDAO;
    private final CategoryDAO categoryDAO;
    private final OAuthDAO oAuthDAO;
    private final PasswordEncoder passwordEncoder;

    //  일반 회원가입
    @Transactional
    public void join(MemberDTO memberDTO, MultipartFile profile){
        memberDTO.setMemberPassword(passwordEncoder.encode(memberDTO.getMemberPassword()));
        memberDAO.save(memberDTO);
        log.info(memberDTO.toBusinessMemberVO().toString());

        // 사업자 정보 저장
        BusinessMemberDTO businessMemberDTO = new BusinessMemberDTO();
        businessMemberDTO.setId(memberDTO.getId());
        businessMemberDTO.setBusinessNumber(memberDTO.getBusinessNumber());
        businessMemberDTO.setCompanyName(memberDTO.getCompanyName());
        businessMemberDTO.setCeoName(memberDTO.getCeoName());
        businessMemberDTO.setBusinessType(memberDTO.getBusinessType());
        businessMemberDAO.save(businessMemberDTO.toBusinessMemberVO());

        // 회원가입 정보에서 가져온 카테고리 이름으로 카테고리 조회
        CategoryDTO categoryDTO = categoryDAO.findByCategoryName(memberDTO.getCategoryName()).orElseThrow(null);

        // 사업자 관심사 저장
        CategoryMemberDTO categoryMemberDTO = new CategoryMemberDTO();
        categoryMemberDTO.setMemberId(memberDTO.getId());
        categoryMemberDTO.setCategoryId(categoryDTO.getId());
        categoryMemberDAO.save(categoryMemberDTO);
    }

    @Transactional
    public void joinOAuth(MemberDTO memberDTO, MultipartFile profile, String s3Key) {
        // OAuth 신규가입은 일반 회원가입과 달리 비밀번호 암호화를 하지 않는다.
        // 이미 OAuth 인증을 마친 사용자가 추가정보만 입력한 뒤 최종 가입하는 흐름이다.

        // 1. 회원 본체 저장
        memberDAO.save(memberDTO);

        // 2. 사업자 정보 저장
        BusinessMemberDTO businessMemberDTO = new BusinessMemberDTO();
        businessMemberDTO.setId(memberDTO.getId());
        businessMemberDTO.setBusinessNumber(memberDTO.getBusinessNumber());
        businessMemberDTO.setCompanyName(memberDTO.getCompanyName());
        businessMemberDTO.setCeoName(memberDTO.getCeoName());
        businessMemberDTO.setBusinessType(memberDTO.getBusinessType());
        businessMemberDAO.save(businessMemberDTO.toBusinessMemberVO());

        // 3. 카테고리 조회 후 회원 관심사 저장
        CategoryDTO categoryDTO = categoryDAO.findByCategoryName(memberDTO.getCategoryName())
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다."));

        CategoryMemberDTO categoryMemberDTO = new CategoryMemberDTO();
        categoryMemberDTO.setMemberId(memberDTO.getId());
        categoryMemberDTO.setCategoryId(categoryDTO.getId());
        categoryMemberDAO.save(categoryMemberDTO);

        // 4. OAuth 연동 정보 저장
        OAuthDTO oAuthDTO = new OAuthDTO();
        oAuthDTO.setProvider(memberDTO.getProvider());
        oAuthDTO.setProviderId(memberDTO.getProviderId());
        oAuthDTO.setProfileURL(memberDTO.getProfileURL());
        oAuthDTO.setMemberId(memberDTO.getId());
        oAuthDAO.save(oAuthDTO.toOAuthVO());

        // 5. 프로필 이미지를 직접 업로드한 경우 파일 정보 저장
        if (profile != null && !profile.isEmpty() && s3Key != null && !s3Key.isBlank()) {
            saveFile(memberDTO.getId(), profile, s3Key);
        }
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

    //  이메일 검사(true : 사용가능)
    public boolean checkEmail(String memberEmail){
        return memberDAO.findMemberByMemberEmail(memberEmail).isEmpty();
    }

    //  핸드폰 검사(true : 사용가능)
    public boolean checkPhone(String memberPhone){
        return memberDAO.findMemberByMemberPhone(memberPhone).isEmpty();
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
