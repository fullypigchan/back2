package com.app.globalgates.controller.member;

import com.app.globalgates.dto.MemberDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Tag(name = "Member", description = "Member API")
public interface MemberAPIControllerDocs {
    @Operation(
            summary = "회원 등록",
            description = "화면에서 받은 회원 정보로 회원가입을 한다.",
            parameters = {@Parameter(name = "memberDTO", description = "화면에서 입력한 회원 정보"),
                            @Parameter(name = "imgae", description = "화면에서 입력한 프로필 이미지")}
    )
    public ResponseEntity<?> join(MemberDTO memberDTO, MultipartFile image) throws IOException;
}
