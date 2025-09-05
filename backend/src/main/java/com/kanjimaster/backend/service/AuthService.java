package com.kanjimaster.backend.service;

import com.kanjimaster.JwtUtil;
import com.kanjimaster.backend.dto.request.AuthRequest;
import com.kanjimaster.backend.dto.response.AuthResponse;
import com.kanjimaster.backend.model.User;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class AuthService {
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthResponse login(AuthRequest authRequest) {
        User user = userService.findByEmail(authRequest.getEmail());
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        if (!userService.checkPassword(authRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token);
    }

    public AuthResponse register(AuthRequest authRequest) {
        User user = userService.createUser(authRequest.toUser());
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token);
    }
}
