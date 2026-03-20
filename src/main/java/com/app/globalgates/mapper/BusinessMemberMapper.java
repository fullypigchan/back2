package com.app.globalgates.mapper;

import com.app.globalgates.dto.BusinessMemberDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface BusinessMemberMapper {

//    상입
    public void insert(BusinessMemberDTO businessMemberDTO);
}
