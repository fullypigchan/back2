package com.app.globalgates.auth;

import com.app.globalgates.dto.MemberDTO;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtTokenProvider jwtTokenProvider;
//    private final MemberDAO memberDAO;
//    private final OAuthDAO oAuthDAO;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String provider = oAuth2User.getAttribute("provider");
        String email = oAuth2User.getAttribute("email");
        boolean isExist = oAuth2User.getAttribute("exist");
//        String role = oAuth2User.getAuthorities().stream()
//                .map(auth -> auth.getAuthority()).collect(Collectors.joining());
        String path = "/post/list/1";
        boolean errorCreateTokens = false;

//        if(isExist){
////            기존 SNS 회원
//
//        } else{
//            Optional<MemberDTO> foundMember = memberDAO.findMemberByMemberEmail(email);
//            if(foundMember.isEmpty()){
////            신규 회원
//                MemberDTO memberDTO = new MemberDTO();
//                memberDTO.setMemberEmail(email);
//                memberDTO.setMemberName(oAuth2User.getAttribute("name"));
////                memberDTO.setMemberRole(MemberRole.getMemberRole(role));
//                memberDAO.save(memberDTO);
//
//                OAuthDTO oAuthDTO = new OAuthDTO();
//                oAuthDTO.setProvider(OAuthProvider.getOAuthProvider(provider));
//                oAuthDTO.setMemberId(memberDTO.getId());
//                oAuthDTO.setProviderId(oAuth2User.getAttribute("id"));
//                oAuthDTO.setProfileURL(oAuth2User.getAttribute("profile"));
//                oAuthDAO.save(oAuthDTO.toOAuthVO());
//
//            }else {
////            기존 회원(자동 연동)
//                if(foundMember.get().isMemberEmailVerified()){
//                    OAuthDTO oAuthDTO = new OAuthDTO();
//                    oAuthDTO.setProvider(OAuthProvider.getOAuthProvider(provider));
//                    oAuthDTO.setMemberId(foundMember.get().getId());
//                    oAuthDTO.setProviderId(oAuth2User.getAttribute("id"));
//                    oAuthDTO.setProfileURL(oAuth2User.getAttribute("profile"));
//                    oAuthDAO.save(oAuthDTO.toOAuthVO());
//
//                }else{
//                    path = "/member/login";
//                    errorCreateTokens = true;
//                }
//            }
//        }

        if(!errorCreateTokens) {
            jwtTokenProvider.createAccessToken(email, provider);
            jwtTokenProvider.createRefreshToken(email, provider);
        }

        response.sendRedirect(path);
    }
}
