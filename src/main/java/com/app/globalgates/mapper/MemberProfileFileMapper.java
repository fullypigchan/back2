package com.app.globalgates.mapper;

import com.app.globalgates.dto.MemberProfileFileDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MemberProfileFileMapper {

//    사진 추가
    public void insert(MemberProfileFileDTO memberProfileFileDTO);
}
