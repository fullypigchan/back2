package com.app.globalgates.mapper;

import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.common.enumeration.ProfileImageType;
import com.app.globalgates.domain.FileVO;
import com.app.globalgates.dto.BusinessMemberDTO;
import com.app.globalgates.dto.FileDTO;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.MemberProfileFileDTO;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Slf4j
public class MemberMapperTests {

    @Autowired
    private MemberMapper memberMapper;
    @Autowired
    private BusinessMemberMapper businessMemberMapper;
    @Autowired
    private MemberProfileFileMapper memberProfileFileMapper;
    @Autowired
    private FileMapper fileMapper;

    @Test
    public void insertTest() {
        MemberDTO memberDTO = new MemberDTO();
        MemberProfileFileDTO memberProfileFileDTO = new MemberProfileFileDTO();
        FileDTO fileDTO = new FileDTO();
        BusinessMemberDTO businessMemberDTO = new BusinessMemberDTO();

        memberDTO.setMemberName("test");
        memberDTO.setMemberEmail("sdfas@123");
        memberDTO.setMemberPassword("1234");
        memberDTO.setMemberHandle("test");
        memberDTO.setMemberPhone("010-1234-5678");
        memberDTO.setMemberRegion("울산광역시 중구 약사로 10");
        memberDTO.setPushEnabled(false);
        memberDTO.setBirthDate("991216");

        memberMapper.insert(memberDTO);

        fileDTO.setOriginalName("test");
        fileDTO.setFileName("test");
        fileDTO.setFilePath("/2026/30/18");
        fileDTO.setFileSize(300L);
        fileDTO.setContentType(FileContentType.IMAGE);

        fileMapper.insert(fileDTO);

        memberProfileFileDTO.setId(fileDTO.getId());
        memberProfileFileDTO.setMemberId(memberDTO.getId());
        memberProfileFileMapper.insert(memberProfileFileDTO);

        businessMemberDTO.setId(memberDTO.getId());
        businessMemberDTO.setBusinessNumber("121-1215-551154");
        businessMemberDTO.setCompanyName("벅벅회사");
        businessMemberDTO.setCeoName("홍성호");
        businessMemberDTO.setBusinessType("제조업");

        businessMemberMapper.insert(businessMemberDTO);

        log.info("memberDTO : {}", memberDTO);
        log.info("memberProfileFileDTO : {}", memberProfileFileDTO);
        log.info("fileDTO : {}", fileDTO);
        log.info("businessMemberDTO : {}", businessMemberDTO);


    }

}
