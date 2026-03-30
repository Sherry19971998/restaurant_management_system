package com.example.adminservice.security;

import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.Collections;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;
import java.util.Date;
import java.util.Set;

@Component
public class JwtUtil {
    private final String jwtSecret = "ReplaceWithAStrongSecretKey";
    private final long jwtExpirationMs = 86400000; // 1 day

    public String generateToken(String username, Set<String> roles) {
        return Jwts.builder()
                .setSubject(username)
                .claim("roles", roles)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return getClaims(token).getSubject();
    }

    public Set<String> getRolesFromToken(String token) {
        // Parse roles as List, then convert to Set to avoid RequiredTypeException
        List<String> rolesList = getClaims(token).get("roles", List.class);
        return rolesList == null ? Collections.emptySet() : new HashSet<>(rolesList);
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token).getBody();
    }
}
