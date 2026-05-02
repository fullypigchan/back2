package com.app.globalgates.mapper;

import com.app.globalgates.dto.NewsDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminNewsMapper {
    List<NewsDTO> selectAdminNews();

    int insertAdminNews(NewsDTO newsDTO);

    int updateAdminNews(NewsDTO newsDTO);

    int deleteAdminNews(@Param("id") Long id);
}
