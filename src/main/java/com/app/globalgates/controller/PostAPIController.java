package com.app.globalgates.controller;

import com.app.globalgates.dto.PostDTO;
import com.app.globalgates.dto.PostWithPagingDTO;
import com.app.globalgates.service.PostService;
import com.app.globalgates.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/posts/**")
@Slf4j
public class PostAPIController {
    private final PostService postService;
    private final S3Service s3Service;

    //    게시글 목록 조회
    @GetMapping("list/{page}")
    public PostWithPagingDTO getList(@PathVariable int page, @RequestParam Long memberId) {
        return postService.getList(page, memberId);
    }

    //    게시글 작성
    @PostMapping("/write")
    public void write(PostDTO postDTO,
                      @RequestParam("files") List<MultipartFile> files) throws IOException {
        if (files == null) {
            files = List.of();
        }
        log.info("게시물 {}", postDTO);
        log.info("파일 {}", files);
        String todayPath = postService.writePost(postDTO, files);

        if (!files.isEmpty()) {
            for (MultipartFile file : files) {
                s3Service.uploadFile(file, todayPath);
            }
        }
    }

    //    게시글 수정 (모달로 수정함)
    @PostMapping("update/{id}")
    public void update(PostDTO postDTO,
                       @RequestParam(value = "files", required = false) List<MultipartFile> files) {
        if (files == null) {
            files = List.of();
        }
        postService.update(postDTO, files);
    }

    //    게시글 삭제 - 상태만 변경
    @PostMapping("delete/{id}")
    public void delete(@PathVariable Long id) {
        postService.delete(id);
    }

//    댓글 작성 (판매품목 선택 시 productPostId 전달)
    @PostMapping("/{postId}/replies")
    public void writeReply(@PathVariable Long postId,
                           @RequestBody PostDTO postDTO,
                           @RequestParam(required = false) Long productPostId) {
        postDTO.setReplyPostId(postId);
        postService.writeReply(postDTO, productPostId);
    }
}
