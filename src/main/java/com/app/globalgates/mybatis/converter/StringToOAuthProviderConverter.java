package com.app.globalgates.mybatis.converter;

import com.app.globalgates.common.enumeration.OAuthProvider;
import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

//    화면에서 받은 문자열을 Enum으로 변환
@Component
public class StringToOAuthProviderConverter implements Converter<String, OAuthProvider> {
    @Override
    public OAuthProvider convert(@NonNull String source) {
        return OAuthProvider.getOAuthProvider(source);
    }
}