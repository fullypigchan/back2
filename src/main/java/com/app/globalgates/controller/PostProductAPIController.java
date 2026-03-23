package com.app.globalgates.controller;

import com.app.globalgates.dto.PostProductDTO;
import com.app.globalgates.service.PostProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class PostProductAPIController {
    private final PostProductService postProductService;

//    자신의 판매품목 목록 조회
    @GetMapping("/members/{memberId}")
    public List<PostProductDTO> getMyProducts(@PathVariable Long memberId) {
        return postProductService.getMyProducts(memberId);
    }
}
