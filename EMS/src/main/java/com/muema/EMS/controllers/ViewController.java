package com.muema.EMS.controllers;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {
    @GetMapping("/")
    public String homePage() {
        return "home";
    }
    @GetMapping("/login")
    public String loginPage() {
        return "login"; // This will return the new combined login page
    }

    @GetMapping("/adminDashboard")
    public String adminDashboard() {
        return "adminDashboard";
    }
    @GetMapping("/employeeDashboard")
        public String employeeDashboard(){
        return "employeeDashboard";
    }
    @GetMapping("/manageEmployees")
    public String manageEmployees() {
        return "manageEmployees";
    }
    @GetMapping("/employeeProfile")
     public String employeeProfile() {
        return "employeeProfile";
    }
    @GetMapping("/employeeLeaveApplication")
    public String employeeLeaveApplication() {
        return "employeeLeaveApplication";
    }
    @GetMapping("/manageLeaves")
    public String manageLeaves() {
        return "manageLeaves";
    }
    @GetMapping("/manageTasks")
    public String manageTasks() {
        return "manageTasks";
    }
    @GetMapping("/employeeTasks")
    public String employeeTasks() {
        return "employeeTasks";
    }
    @GetMapping("/financeRequest")
    public String financeRequest() {
        return "financeRequest";
    }
    @GetMapping("/employeefinanceRequest")
    public String employeefinanceRequest() {
        return "employeefinanceRequest";
    }
    @GetMapping("/employeeNotifications")
    public String employeeNotifications() {
        return "employeeNotifications";
    }
    @GetMapping("/notifications")
    public String notifications() {
        return "notifications";
    }

}

