package com.freelancehub.marketplace.security;

import jakarta.servlet.DispatcherType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        return http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .dispatcherTypeMatchers(DispatcherType.ERROR)
                        .permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/projects",
                                "/api/v1/projects/*")
                        .authenticated()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/v1/projects",
                                "/api/v1/projects/*/cancel",
                                "/api/v1/projects/*/proposals")
                        .authenticated()

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/v1/projects/*")
                        .authenticated()
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/projects/*/proposals")
                        .authenticated()
                        .requestMatchers(
                                HttpMethod.GET, "/api/v1/proposals/mine")
                        .authenticated()
                        .anyRequest().denyAll())
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(Customizer.withDefaults()))
                .build();
    }
}