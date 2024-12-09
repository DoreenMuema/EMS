package com.muema.EMS.controllers;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {
    @GetMapping("/")
    public String homePage() {
        return "home";
    }
    @GetMapping("/adminLogin")
    public String adminLogin() {
        return "adminLogin";
    }

    @GetMapping("/employeeLogin")
    public String employeeLogin() {
        return "employeeLogin";
    }
}

