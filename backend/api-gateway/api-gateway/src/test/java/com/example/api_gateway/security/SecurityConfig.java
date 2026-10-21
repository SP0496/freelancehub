package com.example.api_gateway.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(
            ServerHttpSecurity http) {

        return http
                .csrf(csrf -> csrf.disable())
                .securityContextRepository(
                        NoOpServerSecurityContextRepository.getInstance())
                .authorizeExchange(auth -> auth
                        .pathMatchers(
                                HttpMethod.GET,
                                "/api/v1/users/me",
                                "/api/v1/projects",
                                "/api/v1/projects/*")
                        .authenticated()

                        .pathMatchers(
                                HttpMethod.PUT,
                                "/api/v1/users/me",
                                "/api/v1/projects/*")
                        .authenticated()

                        .pathMatchers(
                                HttpMethod.POST,
                                "/api/v1/projects",
                                "/api/v1/projects/*/cancel",
                                "/api/v1/projects/*/proposals")
                        .authenticated()
                        .pathMatchers(
                                HttpMethod.GET,
                                "/api/v1/projects/*/proposals")
                        .authenticated()
                        .pathMatchers(
                                HttpMethod.GET, "/api/v1/proposals/mine")
                        .authenticated()
                        .pathMatchers(
                                HttpMethod.POST,
                                "/api/v1/projects/*/proposals/*/accept")
                        .authenticated()
                        .anyExchange().denyAll())
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(Customizer.withDefaults()))
                .build();
    }
}