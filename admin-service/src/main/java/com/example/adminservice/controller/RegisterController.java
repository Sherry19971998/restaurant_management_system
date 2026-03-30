package com.example.adminservice.controller;

import com.example.adminservice.model.User;
import com.example.adminservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
public class RegisterController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, Object> request) {
        String username = (String) request.get("username");
        String password = (String) request.get("password");
        Object rolesObj = request.get("roles");
        Set<String> roles = new HashSet<>();
        if (rolesObj instanceof Iterable<?>) {
            for (Object r : (Iterable<?>) rolesObj) {
                String role = r.toString();
                if (role.startsWith("ROLE_")) {
                    role = role.substring(5);
                }
                roles.add(role);
            }
        }
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRoles(roles);
        userRepository.save(user);
        Map<String, Object> resp = new HashMap<>();
        resp.put("username", username);
        resp.put("roles", roles);
        return resp;
    }
}
