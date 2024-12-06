package com.muema.EMS.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtils {
    private static final String SECRET_KEY = "48A5360D50EFAE9A612284859CDD1D8F773EDFBEDF89D5B7C83F294392946455";
    private final long EXPIRATION_TIME = 1000 * 60 * 60; // 1 hour

    public String generateToken(String username, String role) {
        long expirationTime = Duration.ofHours(1).toMillis(); // 1 hour
        Instant now = Instant.now();

        String jwtToken = Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusMillis(expirationTime)))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();

        // Logging the generated token and its expiration time
        System.out.println("Generated token: " + jwtToken);
        System.out.println("Token expiration: " + Date.from(now.plusMillis(expirationTime)));

        return jwtToken;
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        final String role = extractRole(token); // Extract role from the token

        // Check if the username matches and if the role is correct
        return (username.equals(userDetails.getUsername()) &&
                !isTokenExpired(token) &&
                userDetails.getAuthorities().stream()
                        .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals(role)));
    }

    // Method to extract a specific claim using a Function (e.g., extract username or roles)
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token); // Extract all claims first
        return claimsResolver.apply(claims); // Apply the claim resolver function on the claims
    }

    public Claims extractAllClaims(String token) {
        try {
            if (token == null) {
                throw new IllegalArgumentException("Token is missing");
            }

            // If the token has the "Bearer " prefix, remove it
            if (token.startsWith("Bearer ")) {
                token = token.substring(7); // Remove "Bearer " prefix
            }

            System.out.println("Extracting claims from token: " + token); // Log token for debugging

            return Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY) // Use your secret key
                    .setAllowedClockSkewSeconds(60) // Allow clock skew
                    .build()
                    .parseClaimsJws(token) // Parse the JWT
                    .getBody(); // Extract claims from the body

        } catch (JwtException | IllegalArgumentException e) {
            System.err.println("Failed to parse token: " + e.getMessage());
            throw new IllegalArgumentException("Invalid JWT token", e); // Handle error
        }
    }


    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public String extractRole(String jwt) {
        return extractClaim(jwt, claims -> claims.get("role", String.class));
    }

    public boolean isAdmin(String token) {
        String role = extractRole(token);
        return "ROLE_ADMIN".equals(role);
    }

    // New method to extract the username from the token (subject claim)
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject); // Claims::getSubject extracts the "sub" (subject) claim
    }
}
