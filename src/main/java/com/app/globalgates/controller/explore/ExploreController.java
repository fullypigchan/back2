package com.app.globalgates.controller.explore;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ExploreController {

    @GetMapping("/explore")
    public String goTOExplorePage() {
        return "explore/explore";
    }

    @GetMapping("/explore/search")
    public String goToSearchPage() {
        return "explore/explore-result";
    }

}
