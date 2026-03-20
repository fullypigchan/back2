package com.app.globalgates.auth;

import com.app.globalgates.common.enumeration.MemberRole;
import com.app.globalgates.common.enumeration.Status;
import com.app.globalgates.dto.MemberDTO;
import lombok.Getter;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
@ToString
public class CustomUserDetails implements UserDetails {
    private Long id;
    private String memberName;
    private String memberEmail;
    private String memberPassword;
    private boolean memberEmailVerified;
    private Status memberStatus;
    private MemberRole memberRole;
    private String createdDate;
    private String updatedDate;

    public CustomUserDetails(MemberDTO memberDTO) {
        this.id = memberDTO.getId();
        this.memberName = memberDTO.getMemberName();
        this.memberEmail = memberDTO.getMemberEmail();
        this.memberPassword = memberDTO.getMemberPassword();
//        this.memberEmailVerified = memberDTO.isMemberEmailVerified();
        this.memberStatus = memberDTO.getMemberStatus();
        this.memberRole = memberDTO.getMemberRole();
        this.createdDate = memberDTO.getCreatedDatetime();
        this.updatedDate = memberDTO.getUpdatedDatetime();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return memberRole.getAuthorities();
    }

    @Override
    public String getPassword() {
        return memberPassword;
    }

    @Override
    public String getUsername() {
        return memberEmail;
    }
}
