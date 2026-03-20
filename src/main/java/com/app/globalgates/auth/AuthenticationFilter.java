package com.app.globalgates.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
@RequiredArgsConstructor
public class AuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String accessToken = jwtTokenProvider.parseTokenFromHeader(request);
        log.info("accessToken: {}", accessToken);

        if(accessToken != null){
            log.info("Token found: {}", accessToken);
            if(jwtTokenProvider.validateToken(accessToken)){
                log.info("Token is valid");
                if(jwtTokenProvider.isTokenInBlacklist(accessToken)){
                    log.info("Token is blacklisted");
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token is blacklisted");
                    return;
                }

                UsernamePasswordAuthenticationToken authentication =
                        (UsernamePasswordAuthenticationToken) jwtTokenProvider.getAuthentication(accessToken);

//                요청 정보 저장
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.info("Authentication Success: {}", authentication);
                log.info("Save in SecurityContext Success: {}", SecurityContextHolder.getContext().getAuthentication());

            }else{
                log.error("Token is not valid");
            }
        }else{
//            액세스 토큰이 없을 때
            String cookieRefreshToken = null;

            if(request.getCookies() != null){
                for(Cookie cookie : request.getCookies()){
                    if("refreshToken".equals(cookie.getName())){
                        cookieRefreshToken = cookie.getValue();
                    }
                }
            }

            if(cookieRefreshToken != null){
                String username = jwtTokenProvider.getUsername(cookieRefreshToken);
                if(jwtTokenProvider.checkRefreshTokenBetweenCookieAndRedis(username, cookieRefreshToken)){
                    if(jwtTokenProvider.validateToken(cookieRefreshToken)){
                        Authentication authentication = jwtTokenProvider.getAuthentication(cookieRefreshToken);

                        String newAccessToken = jwtTokenProvider.createAccessToken(username);
                        jwtTokenProvider.createRefreshToken(username);

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        response.setHeader("Authorization", "Bearer " + newAccessToken);
                    }
                }
            }else{
                log.error("No token found");
            }
        }

//        이 코드를 호출해서 필터 체인에 있는 다음 필터에게 요청과 응답 처리를 넘김
//        만약 doFilter 메소드를 호출하지 않으면, 필터 체인의 다음 필터는 실행되지 않고 요청이 멈춤
        filterChain.doFilter(request,response);
    }
}
