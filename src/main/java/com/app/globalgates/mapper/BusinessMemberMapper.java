package com.app.globalgates.mapper;

import com.app.globalgates.domain.BusinessMemberVO;
import com.app.globalgates.dto.BusinessMemberDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface BusinessMemberMapper {

    // 사업자 정보 등록
    public void insert(BusinessMemberVO businessMemberVO);
}
