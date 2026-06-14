package com.himanshu.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import javax.crypto.SecretKey;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Application security/configuration component for JwtProviderTest.
 */
class JwtProviderTest {

    @Test
    void generateTokenAndExtractEmail_shouldWork() {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                "user@example.com",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );

        String jwt = JwtProvider.generateToken(authentication);
        String email = JwtProvider.getEmailFromJwtToken("Bearer " + jwt);

        assertNotNull(jwt);
        assertEquals("user@example.com", email);
    }

    @Test
    void generateToken_shouldContainExpectedClaimsAndExpiryWindow() {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                "claims@example.com",
                null,
                List.of(
                        new SimpleGrantedAuthority("ROLE_USER"),
                        new SimpleGrantedAuthority("ROLE_ADMIN")
                )
        );

        String jwt = JwtProvider.generateToken(authentication);
        SecretKey key = Keys.hmacShaKeyFor(JwtConstant.SECRET_KEY.getBytes());
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(jwt)
                .getBody();

        long ttlMillis = claims.getExpiration().getTime() - claims.getIssuedAt().getTime();

        assertEquals("claims@example.com", claims.get("email"));
        assertNotNull(claims.get("authorities"));
        assertTrue(ttlMillis >= 86_395_000 && ttlMillis <= 86_405_000);
    }

    @Test
    void populateAuthorities_shouldIncludeAllGrantedAuthorities() {
        String authorities = JwtProvider.populateAuthorities(List.of(
                new SimpleGrantedAuthority("ROLE_USER"),
                new SimpleGrantedAuthority("ROLE_ADMIN")
        ));

        assertTrue(authorities.contains("ROLE_USER"));
        assertTrue(authorities.contains("ROLE_ADMIN"));
    }
}
