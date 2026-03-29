package com.app.globalgates.controller.friends;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FriendsController {
    @GetMapping("/friends")
    public String goToFriends() {
        return "Friends/Friends";
    }
}
