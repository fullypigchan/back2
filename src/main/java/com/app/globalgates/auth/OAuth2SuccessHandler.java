package com.app.globalgates.auth;

import com.app.globalgates.common.enumeration.MemberRole;
import com.app.globalgates.common.enumeration.OAuthProvider;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.OAuthDTO;
import com.app.globalgates.repository.MemberDAO;
import com.app.globalgates.repository.OAuthDAO;
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
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberDAO memberDAO;
    private final OAuthDAO oAuthDAO;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String provider = oAuth2User.getAttribute("provider");
        String email = oAuth2User.getAttribute("email");
        String phone = oAuth2User.getAttribute("phone");
        boolean isExist = oAuth2User.getAttribute("exist");
        String role = oAuth2User.getAuthorities().stream()
                .map(auth -> auth.getAuthority()).collect(Collectors.joining());
        String path = "/main/main";
        boolean errorCreateTokens = false;
        String loginId = "";

        if(email != null && !email.isBlank()) {
            loginId = email;
        } else if(phone != null && !phone.isBlank()) {
            loginId = phone;
        } else {
            path = "/member/join";
            errorCreateTokens = true;
        }

        if(isExist){
//            기존 SNS 회원

        } else{
            Optional<MemberDTO> foundMember = memberDAO.findMemberByLoginId(loginId);
            if(foundMember.isEmpty()){
//            신규 회원
                MemberDTO memberDTO = new MemberDTO();
                memberDTO.setMemberEmail(email);
                memberDTO.setMemberPhone(phone);
                memberDTO.setMemberName(oAuth2User.getAttribute("name"));
                memberDTO.setMemberRole(MemberRole.getMemberRole(role));
                memberDAO.save(memberDTO);

                OAuthDTO oAuthDTO = new OAuthDTO();
                oAuthDTO.setProvider(OAuthProvider.getOAuthProvider(provider));
                oAuthDTO.setMemberId(memberDTO.getId());
                oAuthDTO.setProviderId(oAuth2User.getAttribute("id"));
                oAuthDTO.setProfileURL(oAuth2User.getAttribute("profile"));
                oAuthDAO.save(oAuthDTO.toOAuthVO());

            }else {
//            기존 회원(자동 연동)
                if(foundMember.get().isMemberLoginVerified()){
                    OAuthDTO oAuthDTO = new OAuthDTO();
                    oAuthDTO.setProvider(OAuthProvider.getOAuthProvider(provider));
                    oAuthDTO.setMemberId(foundMember.get().getId());
                    oAuthDTO.setProviderId(oAuth2User.getAttribute("id"));
                    oAuthDTO.setProfileURL(oAuth2User.getAttribute("profile"));
                    oAuthDAO.save(oAuthDTO.toOAuthVO());

                }else{
                    path = "/member/join";
                    errorCreateTokens = true;
                }
            }
        }

        if(!errorCreateTokens) {
            jwtTokenProvider.createAccessToken(loginId, provider);
            jwtTokenProvider.createRefreshToken(loginId, provider);
        }

        response.sendRedirect(path);
    }
}
