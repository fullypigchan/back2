package com.app.globalgates.controller;

import com.app.globalgates.dto.PostDTO;
import com.app.globalgates.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/post/**")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    //    메인 페이지 - 게시글 탭
    @GetMapping("list")
    public String goToMain() {
        return "post/list";
    }

    //    게시글 상세 페이지
    @GetMapping("detail/{id}")
    public String goToPostDetail(@PathVariable Long id, @RequestParam(required = false) Long memberId, Model model) {
        PostDTO postDTO = postService.getDetail(id, memberId);
        model.addAttribute("post", postDTO);
        return "post/detail";
    }
}
