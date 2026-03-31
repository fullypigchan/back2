package com.app.globalgates.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/estimation/**")
public class EstimationController {
    @Value("${google.maps.api-key:}")
    private String googleMapsApiKey;

    @GetMapping("list")
    public String goToList() {
        return "estimation/estimation-list";
    }

    @GetMapping("regist")
    public String goToRegist(Model model) {
        model.addAttribute("googleMapsApiKey", googleMapsApiKey);
        return "estimation/estimation-regist";
    }
}
