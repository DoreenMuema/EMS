package com.muema.EMS.filters;

import com.muema.EMS.services.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private JwtUtils jwtUtils;
    private UserDetailsService userDetailsService;

    // Constructor-based injection remains, but use setter injection for dependencies
    @Autowired
    public void setJwtUtils(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Autowired
    public void setUserDetailsService(@Lazy UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authorizationHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            // Extract token from the header
            token = authorizationHeader.substring(7);

            try {
                // Extract the email from the token
                email = jwtUtils.extractEmail(token);

                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Load user details by username (email)
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                    // Validate the token
                    boolean isValidToken = jwtUtils.validateToken(token, userDetails);

                    if (isValidToken) {
                        // Set the authentication context
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authToken.setDetails(request);
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    } else {
                        // Invalid token, respond with unauthorized status
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        return;
                    }
                }
            } catch (Exception e) {
                // In case of any exception, respond with unauthorized status
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }

        // Continue filter chain
        filterChain.doFilter(request, response);
    }
}