package com.kanjimaster.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class WebConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/**").permitAll()
                        .requestMatchers("/v1/api-docs/**").permitAll()  
                        .requestMatchers("/swagger-ui/**").permitAll() 
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .anyRequest().permitAll()
                );

        return http.build();
    }
}
