
package com.app.globalgates.service;

import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.common.exception.PostNotFoundException;
import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.common.search.PostSearch;
import com.app.globalgates.domain.PostFileVO;
import com.app.globalgates.dto.*;
import com.app.globalgates.repository.FileDAO;
import com.app.globalgates.repository.PostDAO;
import com.app.globalgates.repository.PostFileDAO;
import com.app.globalgates.repository.PostHashtagDAO;
import com.app.globalgates.repository.ReplyProductRelDAO;
import com.app.globalgates.util.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collector;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class PostService {
    private final PostDAO postDAO;
    private final PostFileDAO postFileDAO;
    private final FileDAO fileDAO;
    private final PostHashtagDAO postHashtagDAO;
    private final ReplyProductRelDAO replyProductRelDAO;
    private final S3Service s3Service;

//    게시글 작성
    public void writePost(PostDTO postDTO) {
        postDAO.save(postDTO);

        //    태그 저장 (없으면 생성, 있으면 기존꺼 쓰기)
        postDTO.getHashtags().forEach(hashtagDTO -> {
            Optional<PostHashtagDTO> foundHashtag = postHashtagDAO.findByTagName(hashtagDTO.getTagName());

            if (foundHashtag.isEmpty()) {
                postHashtagDAO.save(hashtagDTO);
            } else {
                hashtagDTO.setId(foundHashtag.get().getId());
            }

            postHashtagDAO.saveRel(postDTO.getId(), hashtagDTO.getId());
        });
    }

//    게시글 파일 저장 (S3 키 기반)
    public void saveFile(Long postId, MultipartFile file, String s3Key) {
        FileDTO fileDTO = new FileDTO();
        fileDTO.setOriginalName(file.getOriginalFilename());
        fileDTO.setFileName(s3Key.substring(s3Key.lastIndexOf("/") + 1));
        fileDTO.setFilePath(s3Key);
        fileDTO.setFileSize(file.getSize());
        fileDTO.setContentType(file.getContentType().contains("image") ? FileContentType.IMAGE
                : file.getContentType().contains("video")
                ? FileContentType.VIDEO : FileContentType.ETC);
        fileDAO.save(fileDTO);

        PostFileDTO postFileDTO = new PostFileDTO();
        postFileDTO.setFileId(fileDTO.getId());
        postFileDTO.setPostId(postId);
        postFileDAO.save(postFileDTO.toPostFileVO());
    }

    //    게시글 목록 조회
    public PostWithPagingDTO getList(int page, Long memberId) {
        Criteria criteria = new Criteria(page, postDAO.findTotal());
        List<PostDTO> posts = postDAO.findAll(criteria, memberId);

        criteria.setHasMore(posts.size() > criteria.getRowCount());
        if (criteria.isHasMore()) posts.remove(posts.size() - 1);

        posts.forEach(postDTO -> {
            postDTO.setHashtags(postHashtagDAO.findAllByPostId(postDTO.getId()));
            postDTO.setPostFiles(postFileDAO.findAllByPostId(postDTO.getId()));
        });

        PostWithPagingDTO postWithPagingDTO = new PostWithPagingDTO();
        postWithPagingDTO.setPosts(posts);
        postWithPagingDTO.setCriteria(criteria);
        return postWithPagingDTO;
    }

    //    게시글 단건 조회
    public PostDTO getDetail(Long id, Long memberId) {
        PostDTO postDTO = postDAO.findById(id, memberId)
                .orElseThrow(PostNotFoundException::new);

        postDTO.setHashtags(postHashtagDAO.findAllByPostId(id));
        postDTO.setPostFiles(postFileDAO.findAllByPostId(id));
        return postDTO;
    }

    //    게시글 수정
    public void update(PostDTO postDTO) {
        postDAO.setPost(postDTO.toPostVO());

        //    태그 수정 (원래 묶인 관계 삭제하고 저장)
        postHashtagDAO.deleteRelByPostId(postDTO.getId());
        postDTO.getHashtags().forEach(hashtagDTO -> {
            postHashtagDAO.save(hashtagDTO);
            if (hashtagDTO.getId() == null) {
                hashtagDTO.setId(postHashtagDAO.findByTagName(hashtagDTO.getTagName())
                        .orElseThrow().getId());
            }
            postHashtagDAO.saveRel(postDTO.getId(), hashtagDTO.getId());
        });

        //    기존 파일 삭제 (S3 + DB)
        if (postDTO.getFileIdsToDelete() != null) {
            Arrays.stream(postDTO.getFileIdsToDelete()).forEach(fileId -> {
                fileDAO.findById(Long.valueOf(fileId)).ifPresent(fileVO -> {
                    s3Service.deleteFile(fileVO.getFilePath());
                });
                postFileDAO.delete(Long.valueOf(fileId));
                fileDAO.delete(Long.valueOf(fileId));
            });
        }
    }

    // 인기순, 최신순 게시글 목록 조회
    public PostWithPagingDTO getListBySearch(int page, PostSearch search) {
        PostWithPagingDTO postWithPagingDTO = new PostWithPagingDTO();
        Criteria criteria = new Criteria(page, postDAO.findSearchTotal(search));

        // 이미지 불러오기
        List<PostDTO> posts = postDAO.findBySearch(criteria, search).stream()
                .map(postDTO -> {
                    List<PostFileDTO> images = new ArrayList<>(postFileDAO.findAllByPostId(postDTO.getId()));
                    if(!images.isEmpty()) {
                        postDTO.setPostFiles(images);
                    }
                    return postDTO;
                }).collect(Collectors.toList());

        criteria.setHasMore(posts.size() > criteria.getRowCount());
        postWithPagingDTO.setCriteria(criteria);

        if(criteria.isHasMore()) {
            posts.remove(posts.size() - 1);
        }

        for (PostDTO post: posts) {
            post.setCreatedDatetime(DateUtils.toRelativeTime(post.getCreatedDatetime()));
        };
        postWithPagingDTO.setPosts(posts);

        return postWithPagingDTO;
    }

    //    게시글 삭제 = 상태 inactive로.
    public void delete(Long id) {
        postDAO.delete(id);
    }

//    댓글 작성 (판매품목 선택 시 관계 저장)
    public void writeReply(PostDTO postDTO, Long productPostId) {
        postDAO.save(postDTO);

        if (productPostId != null) {
            ReplyProductRelDTO relDTO = new ReplyProductRelDTO();
            relDTO.setReplyPostId(postDTO.getId());
            relDTO.setProductPostId(productPostId);
            replyProductRelDAO.save(relDTO);
        }
    }
    // 오늘자 경로 생성
    public String getTodayPath(){
        return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
    }
}