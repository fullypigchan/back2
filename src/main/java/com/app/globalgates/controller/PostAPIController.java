package com.app.globalgates.controller;

import com.app.globalgates.dto.PostDTO;
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

    //    게시글 목록 조회 (무한스크롤)
    @GetMapping("list/{page}")
    public List<PostDTO> getList(@PathVariable int page, @RequestParam(required = false) Long memberId) {
        return postService.getList(page, memberId);
    }

    //    게시글 작성 (모달로 씀)
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
    @PostMapping("/{id}")
    public void update(PostDTO postDTO,
                       @RequestParam(value = "files", required = false) List<MultipartFile> files) {
        if (files == null) {
            files = List.of();
        }
        postService.update(postDTO, files);
    }

    //    게시글 삭제 - 상태만 변경
    @PostMapping("/{id}")
    public void delete(@PathVariable Long id) {
        postService.delete(id);
    }
}
