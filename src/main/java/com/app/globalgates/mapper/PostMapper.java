
package com.app.globalgates.mapper;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.common.search.PostSearch;
import com.app.globalgates.domain.PostVO;
import com.app.globalgates.dto.PostDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface PostMapper {
    //    게시글등록
    public void insert(PostDTO postDTO);

    //    게시글수정
    public void update(PostVO postVO);

    //    게시글삭제
    public void delete(Long id);

    //    게시글 단건 조회
    public Optional<PostDTO> selectById(@Param("id") Long id, @Param("memberId") Long memberId);

    //    게시글 목록 조회 (메인 피드)
    public List<PostDTO> selectAll(@Param("criteria") Criteria criteria, @Param("memberId") Long memberId);

    //    게시글 전체 개수
    public int selectTotal();

    //    게시글 검색 조회
    public List<PostDTO> selectBySearch(@Param("criteria") Criteria criteria, @Param("postSearch") PostSearch postSearch);

    //     검색한 게시글 총 개수
    public int selectTotalBySearch(@Param("search") PostSearch search);
}