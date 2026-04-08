package com.app.globalgates.controller.inquiry;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.InquiryMemberWithPagingDTO;
import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inqury/**")
@RequiredArgsConstructor
@Slf4j
public class InquiryAPIController implements InquiryAPIControllerDocs {
    private final MemberService memberService;
    private final S3Service s3Service;

    @PostMapping("member-list/{page}")
    public ResponseEntity<?> getInquiryMembers(@PathVariable int page,
                                               @RequestBody Map<String, String> body,
                                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        String categoryName = body.get("categoryName");

        InquiryMemberWithPagingDTO inquiryDTO = memberService.getInquiryMembers(page, categoryName, userDetails.getId());
        inquiryDTO.getMembers().forEach(inquiryMemberDTO -> {
            if(inquiryMemberDTO.getFilePath() != null && !inquiryMemberDTO.getFilePath().isEmpty()) {
                try {
                    inquiryMemberDTO.setFilePath(s3Service.getPresignedUrl(inquiryMemberDTO.getFilePath(), Duration.ofMinutes(10)));
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
        });

        return ResponseEntity.ok(inquiryDTO);
    }
}
