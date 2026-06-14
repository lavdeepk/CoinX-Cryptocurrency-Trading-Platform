package com.himanshu.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import javax.crypto.SecretKey;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

/**
 * Central JWT utility for creating and parsing the application's auth tokens.
 */
public final class JwtProvider {

    private static final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(JwtConstant.SECRET_KEY.getBytes());
    // 24 hours token lifetime.
    private static final long TOKEN_TTL_MILLIS = 86_400_000L;
    private static final String BEARER_PREFIX = "Bearer ";

    private JwtProvider() {
    }

    /**
     * Builds a signed JWT containing email and authorities claims.
     */
    public static String generateToken(Authentication authentication) {
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        String roles = populateAuthorities(authorities);

        return Jwts.builder()
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + TOKEN_TTL_MILLIS))
                .claim("email", authentication.getName())
                .claim("authorities", roles)
                .signWith(SECRET_KEY)
                .compact();
    }

    /**
     * Extracts the email claim from either a raw token or a bearer token value.
     */
    public static String getEmailFromJwtToken(String bearerToken) {
        String rawToken = bearerToken;
        // Accept both "Bearer <token>" and plain token strings.
        if (rawToken != null && rawToken.startsWith(BEARER_PREFIX)) {
            rawToken = rawToken.substring(BEARER_PREFIX.length());
        }

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(rawToken)
                .getBody();

        return String.valueOf(claims.get("email"));
    }

    /**
     * Serializes granted authorities into a comma-separated claim value.
     */
    public static String populateAuthorities(Collection<? extends GrantedAuthority> authorities) {
        Set<String> authorityValues = new HashSet<>();
        for (GrantedAuthority authority : authorities) {
            authorityValues.add(authority.getAuthority());
        }
        return String.join(",", authorityValues);
    }
}
