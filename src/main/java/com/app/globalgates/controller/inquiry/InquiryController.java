package com.app.globalgates.controller.inquiry;

import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/inquiry")
@RequiredArgsConstructor
@Slf4j
public class InquiryController {

    @GetMapping("/chart")
    public String goToInquiryPage() {
        return "Inquiry/inquiry-chart";
    }

    @GetMapping("/member-list")
    public String goToInquiryMemberList() {
        return "Inquiry/Inquiry_list";
    }

}

