package com.app.globalgates.controller.mypage;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.PostProductWithPagingDTO;
import com.app.globalgates.dto.PostProductDTO;
import com.app.globalgates.dto.PostWithPagingDTO;
import com.app.globalgates.service.PostProductService;
import com.app.globalgates.service.PostService;
import com.app.globalgates.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
@Slf4j
public class MypageAPIController {
    private final PostProductService postProductService;
    private final S3Service s3Service;
    private final PostService postService;

    // 마이페이지의 "내 상품" 탭은 로그인한 사용자 본인의 상품만 보여줘야 한다.
    // 그래서 memberId를 프론트에서 받지 않고, 인증 객체에서만 꺼내서 조회한다.
    @GetMapping("/products")
    public PostProductWithPagingDTO getMyProducts(
            @RequestParam(defaultValue = "1") int page,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return postProductService.getMyProducts(page, userDetails.getId());
    }

    // 마이페이지 게시물 탭은 현재 로그인한 사용자가 작성한 "일반 게시글"만 내려준다.
    // memberId를 프론트에서 받지 않고 인증 객체에서만 꺼내서 조회해야
    // 다른 사용자의 게시물을 임의로 조회하는 요청을 막을 수 있다.
    @GetMapping("/posts")
    public PostWithPagingDTO getMyPosts(
            @RequestParam(defaultValue = "1") int page,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return postService.getMyPosts(page, userDetails.getId());
    }

    // 회원가입 join 흐름처럼:
    // 1. 본체 저장
    // 2. 파일이 있으면 S3 업로드
    // 3. 업로드 성공분만 DB 연결
    @PostMapping("/products")
    public ResponseEntity<?> writeProduct(
            PostProductDTO postProductDTO,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) throws IOException {

        // memberId는 프론트가 아닌 로그인 사용자에서만 받는다.
        postProductDTO.setMemberId(userDetails.getId());
        log.info("postProductDTO: {}", postProductDTO);
        if (images != null && !images.isEmpty()) {
            String todayPath = postProductService.getTodayPath();
            List<String> uploadedKeys = new ArrayList<>();

            try {
                postProductService.save(postProductDTO);

                for (MultipartFile image : images) {
                    if (image == null || image.isEmpty()) {
                        continue;
                    }

                    String s3Key = s3Service.uploadFile(image, todayPath);
                    uploadedKeys.add(s3Key);
                    postProductService.saveFile(postProductDTO.getId(), image, s3Key);
                }
            } catch (Exception e) {
                uploadedKeys.forEach(s3Service::deleteFile);

                if (postProductDTO.getId() != null) {
                    postProductService.delete(postProductDTO.getId());
                }

                throw new RuntimeException("상품 등록 실패", e);
            }
        } else {
            postProductService.save(postProductDTO);
        }

        return ResponseEntity.ok(Map.of(
                "id", postProductDTO.getId(),
                "message", "상품 등록 성공"
        ));
    }

    @PostMapping("/products/delete")
    public ResponseEntity<?> deleteProduct(
            @RequestParam Long productId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        // 삭제 권한 판단에 필요한 memberId는 프론트에서 받지 않는다.
        // 항상 현재 로그인한 사용자 id를 기준으로 서비스 계층에 넘겨서
        // 다른 사람 상품 삭제 시도를 서버에서 차단한다.
        postProductService.delete(productId, userDetails.getId());

        return ResponseEntity.ok(Map.of("message", "상품 삭제 성공"));
    }
}
