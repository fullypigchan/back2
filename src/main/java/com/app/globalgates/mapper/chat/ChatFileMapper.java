package com.app.globalgates.mapper.chat;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ChatFileMapper {
    void insert(@Param("fileId") Long fileId, @Param("messageId") Long messageId);
}
