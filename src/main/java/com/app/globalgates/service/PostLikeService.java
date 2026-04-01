package com.app.globalgates.service;

import com.app.globalgates.dto.PostLikeDTO;
import com.app.globalgates.repository.PostLikeDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class PostLikeService {
    private final PostLikeDAO postLikeDAO;

//    좋아요 추가
    @CacheEvict(value = {"post:list", "post", "page:search", "community:post:list"}, allEntries = true)
    public void addLike(PostLikeDTO postLikeDTO) {
        postLikeDAO.save(postLikeDTO);
    }

//    좋아요 삭제
    @CacheEvict(value = {"post:list", "post", "page:search", "community:post:list"}, allEntries = true)
    public void deleteLike(Long memberId, Long postId) {
        postLikeDAO.deleteByMemberIdAndPostId(memberId, postId);
    }

//    좋아요 여부 조회
    public Optional<PostLikeDTO> getLike(Long memberId, Long postId) {
        return postLikeDAO.findByMemberIdAndPostId(memberId, postId);
    }

//    게시글 좋아요 수 조회
    public int getLikeCount(Long postId) {
        return postLikeDAO.countByPostId(postId);
    }
}
