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
}
