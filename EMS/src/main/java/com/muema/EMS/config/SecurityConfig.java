package com.muema.EMS.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests((authorizeRequests) -> authorizeRequests
                        .requestMatchers("/public").permitAll()  // Public endpoint, no authentication needed
                        .anyRequest().authenticated()            // All other endpoints need authentication
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .jwkSetUri("http://localhost:8080/oauth2/jwks")) // Set JWK URI for token validation
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(new BearerTokenAuthenticationEntryPoint())  // Handle unauthorized access
                        .accessDeniedHandler(new BearerTokenAccessDeniedHandler())            // Handle access denial
                );
        return http.build();
    }
}
