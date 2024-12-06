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

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    @Lazy
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // Extract the Authorization header from the request
        String authorizationHeader = request.getHeader("Authorization");

        String token = null;
        String username = null;

        // Check if the Authorization header is present and starts with "Bearer "
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            // Extract the token from the header
            token = authorizationHeader.substring(7);
            // Extract the username from the token
            username = jwtUtils.extractUsername(token);

            // If the username is valid, proceed with authentication
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // Validate the token
                boolean isValidToken = jwtUtils.validateToken(token, userDetails);

                // Log the validation process for debugging
                System.out.println("Extracted username: " + username);
                System.out.println("Is token valid: " + isValidToken);

                if (isValidToken) {
                    System.out.println("Valid token for user: " + username);
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(request);
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    // Invalid token: set status to Unauthorized (401) and return immediately
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    System.out.println("Invalid token for user: " + username);
                    return;
                }
            }
        }
        filterChain.doFilter(request, response);
    }



}
