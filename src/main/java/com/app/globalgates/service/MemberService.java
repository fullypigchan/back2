package com.app.globalgates.service;

import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.common.enumeration.ProfileImageType;
import com.app.globalgates.common.exception.MemberLoginFailException;
import com.app.globalgates.common.exception.MemberNotFoundException;
import com.app.globalgates.common.pagination.Criteria;
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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collector;
import java.util.stream.Collectors;

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

    //  배너 이미지 저장
    @Transactional
    public void saveBannerFile(Long memberId, MultipartFile image, String s3Key) {
        // 프로필 이미지 저장 로직과 같은 구조를 유지하되,
        // 회원-파일 관계만 배너 전용 mapper를 타도록 분리한다.
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
        memberProfileFileDTO.setProfileImageType(ProfileImageType.BANNER);
        memberProfileFileDAO.saveBanner(memberProfileFileDTO);
    }

    //  프로필 수정 텍스트 저장
    @Transactional
    public void update(MemberDTO memberDTO) {
        // 이름(닉네임), 자기소개, 생년월일만 갱신한다.
        // 이미지 교체 흐름은 컨트롤러에서 upload/save/delete 순서로 직접 조합한다.
        memberDAO.update(memberDTO);
    }

    //  현재 프로필 이미지 조회
    public MemberProfileFileDTO getProfileFile(Long memberId) {
        return memberProfileFileDAO.findByMemberId(memberId);
    }

    //  현재 배너 이미지 조회
    public MemberProfileFileDTO getBannerFile(Long memberId) {
        return memberProfileFileDAO.findBannerByMemberId(memberId);
    }

    //  프로필/배너 이미지 관계 및 파일 메타 삭제
    @Transactional
    public void deleteProfileFile(Long fileId) {
        // member_profile_file 관계와 tbl_file 메타는 항상 같이 지워야
        // 다음 조회에서 이미 삭제된 파일 id가 남지 않는다.
        memberProfileFileDAO.delete(fileId);
        fileDAO.delete(fileId);
    }

    //  이메일 검사(true : 사용가능)
    public boolean checkEmail(String memberEmail){
        return memberDAO.findMemberByMemberEmail(memberEmail).isEmpty();
    }

    //  핸드폰 검사(true : 사용가능)
    public boolean checkPhone(String memberPhone){
        return memberDAO.findMemberByMemberPhone(memberPhone).isEmpty();
    }

    //  handle 검사(true : 사용가능)
    public boolean checkHandle(String memberHandle){
        // DB에는 @가 포함된 형태로 저장되므로 조회 시에도 동일한 형태로 맞춘다.
        return memberDAO.findMemberByMemberHandle("@" + memberHandle).isEmpty();
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

    // 검색 값에 따른 회원들 조회
    @Cacheable(value="member", key="'page:' + #page" + " + ':keyword:' + #keyword")
    @LogStatusWithReturn
    public MemberWithPagingDTO getSearchMember(int page, Long memberId, String keyword) {
        MemberWithPagingDTO memberWithPagingDTO = new MemberWithPagingDTO();
        Criteria criteria = new Criteria(page, memberDAO.findMembersByKeywordWithFollow(memberId, keyword).size());

        List<MemberDTO> members = memberDAO.findMembersByKeywordWithFollow(memberId, keyword).stream()
                .map(memberDTO -> {
                    MemberProfileFileDTO profile = memberProfileFileDAO.findByMemberId(memberDTO.getId());
                    if(profile != null) {
                        memberDTO.setProfileURL(profile.getFilePath());
                    }
                    return memberDTO;
                }).collect(Collectors.toList());

        criteria.setHasMore(members.size() > criteria.getRowCount());
        memberWithPagingDTO.setCriteria(criteria);

        memberWithPagingDTO.setMembers(members);

        return memberWithPagingDTO;
    }

    // 전문가 페이지 - 거래처 등록 목록 조회
    @Cacheable(value="inquiry:member", key="'page:' + #page" + " + ':categoryName:' + #categoryName" + " + ':memberId:' + #memberId")
    @LogStatusWithReturn
    public InquiryMemberWithPagingDTO getInquiryMembers (int page, String categoryName, Long memberId) {
        InquiryMemberWithPagingDTO inquiryMemberWithPagingDTO = new InquiryMemberWithPagingDTO();
        Criteria criteria = new Criteria(page, memberDAO.findInquiryTotal(categoryName, memberId));

        List<InquiryMemberDTO> members = memberDAO.findInquiryMembers(criteria, categoryName, memberId).stream()
                .map(memberDTO -> {
                    MemberProfileFileDTO profile = memberProfileFileDAO.findByMemberId(memberDTO.getId());
                    if(profile != null) {
                        memberDTO.setFilePath(profile.getFilePath());
                    }
                    return memberDTO;
                }).collect(Collectors.toList());
        criteria.setHasMore(members.size() > criteria.getRowCount());
        inquiryMemberWithPagingDTO.setCriteria(criteria);

        if(criteria.isHasMore()) {
            members.remove(members.size() - 1);
        }

        inquiryMemberWithPagingDTO.setMembers(members);

        return inquiryMemberWithPagingDTO;
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
