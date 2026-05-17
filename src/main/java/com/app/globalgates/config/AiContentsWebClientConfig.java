package com.app.globalgates.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

// FastAPI ai_contents 서비스 호출용 WebClient — base url 과 내부 토큰을 1회 wiring
@Configuration
public class AiContentsWebClientConfig {

    @Value("${ai-contents.base-url}")
    private String baseUrl;

    @Value("${internal-ai.token}")
    private String internalToken;

    @Bean
    public WebClient ragWebClient() {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("X-Internal-Token", internalToken)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }
}
