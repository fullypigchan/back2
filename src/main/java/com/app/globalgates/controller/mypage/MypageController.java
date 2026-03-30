package com.app.globalgates.controller.mypage;

import com.app.globalgates.auth.JwtTokenProvider;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.MemberProfileFileDTO;
import com.app.globalgates.repository.MemberProfileFileDAO;
import com.app.globalgates.service.FollowService;
import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.S3Service;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/mypage/**")
public class MypageController {
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberService memberService;
    private final MemberProfileFileDAO memberProfileFileDAO;
    private final S3Service s3Service;
    private final FollowService followService;

    @GetMapping("/mypage")
    public String goToMypage(HttpServletRequest request, Model model) {
        // 메인 페이지와 같은 방식으로 로그인 토큰에서 사용자 식별자를 꺼낸다.
        // 이렇게 해야 템플릿이 현재 로그인 회원 기준으로 이름/핸들을 렌더링할 수 있다.
        String token = jwtTokenProvider.parseTokenFromHeader(request);
        String loginId = jwtTokenProvider.getUsername(token);
        MemberDTO member = memberService.getMember(loginId);

        // 프로필/배너 파일이 없을 때도 화면이 깨지지 않도록 기본 이미지를 먼저 둔다.
        String profileImageUrl = "/images/main/global-gates-logo.png";
        String bannerImageUrl = "/images/main/lown1.jpg";

        MemberProfileFileDTO profileFile = memberProfileFileDAO.findByMemberId(member.getId());
        MemberProfileFileDTO bannerFile = memberProfileFileDAO.findBannerByMemberId(member.getId());

        try {
            // DB에는 S3 key가 저장되어 있으므로 화면에서는 presigned url로 바꿔서 내려준다.
            if (profileFile != null && profileFile.getFileName() != null && !profileFile.getFileName().isEmpty()) {
                profileImageUrl = s3Service.getPresignedUrl(profileFile.getFileName(), java.time.Duration.ofMinutes(10));
            }

            if (bannerFile != null && bannerFile.getFileName() != null && !bannerFile.getFileName().isEmpty()) {
                bannerImageUrl = s3Service.getPresignedUrl(bannerFile.getFileName(), java.time.Duration.ofMinutes(10));
            }
        } catch (java.io.IOException e) {
            // presigned url 생성 실패 시에는 기본 이미지를 그대로 사용한다.
            profileImageUrl = "/images/main/global-gates-logo.png";
            bannerImageUrl = "/images/main/lown1.jpg";
        }

        // 마이페이지 상단의 커넥팅/커넥터 수는 현재 로그인한 회원 기준으로 렌더링해야 한다.
        // follow 도메인에는 이미 팔로잉/팔로워 목록 조회가 있으므로,
        // 이번 단계에서는 count 전용 쿼리를 새로 만들지 않고 목록 크기만 사용해서 가장 가볍게 연결한다.
        int connectingCount = followService.getFollowings(member.getId()).size();
        int connectorCount = followService.getFollowers(member.getId()).size();

        // mypage 템플릿에서는 member + 이미지 url 모델을 같이 사용한다.
        model.addAttribute("member", member);
        model.addAttribute("profileImageUrl", profileImageUrl);
        model.addAttribute("bannerImageUrl", bannerImageUrl);
        model.addAttribute("connectingCount", connectingCount);
        model.addAttribute("connectorCount", connectorCount);
        return "mypage/mypage";
    }
}
