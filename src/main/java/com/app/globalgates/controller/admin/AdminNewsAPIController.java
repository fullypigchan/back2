package com.app.globalgates.controller.admin;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.NewsDTO;
import com.app.globalgates.service.AdminNewsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin/news")
@RequiredArgsConstructor
public class AdminNewsAPIController {
    private final AdminNewsService adminNewsService;

    @GetMapping
    public ResponseEntity<List<NewsDTO>> getAdminNews() {
        return ResponseEntity.ok(adminNewsService.getAdminNews());
    }

    @PostMapping
    public ResponseEntity<Void> createAdminNews(@RequestBody NewsDTO newsDTO,
                                                @AuthenticationPrincipal CustomUserDetails userDetails) {
        // 클라이언트가 보낸 adminId는 무시 — 인증 사용자(어드민)으로 강제
        if (userDetails != null) {
            newsDTO.setAdminId(userDetails.getId());
        }
        log.info("어드민 뉴스 등록 — adminId: {}, title: {}, type: {}",
                newsDTO.getAdminId(), newsDTO.getNewsTitle(), newsDTO.getNewsType());
        adminNewsService.createAdminNews(newsDTO);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateAdminNews(@PathVariable Long id,
                                                @RequestBody NewsDTO newsDTO,
                                                @AuthenticationPrincipal CustomUserDetails userDetails) {
        newsDTO.setId(id);
        if (userDetails != null) {
            newsDTO.setAdminId(userDetails.getId());
        }
        log.info("어드민 뉴스 수정 — id: {}, adminId: {}", id, newsDTO.getAdminId());
        int affected = adminNewsService.updateAdminNews(newsDTO);
        return affected > 0 ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdminNews(@PathVariable Long id) {
        log.info("어드민 뉴스 삭제 — id: {}", id);
        int affected = adminNewsService.deleteAdminNews(id);
        return affected > 0 ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
}
