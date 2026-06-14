package com.himanshu.config;

import com.himanshu.model.User;
import com.himanshu.model.enums.USER_ROLE;
import com.himanshu.repository.UserRepository;
import com.himanshu.service.WalletService;
import com.himanshu.service.WatchlistService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@Component
/**
 * Handles successful Google OAuth2 logins by provisioning/syncing a local user,
 * issuing a JWT, and redirecting back to the frontend with token or error state.
 */
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);

    private final UserRepository userRepository;
    private final WatchlistService watchlistService;
    private final WalletService walletService;
    private final PasswordEncoder passwordEncoder;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public OAuth2LoginSuccessHandler(
            UserRepository userRepository,
            WatchlistService watchlistService,
            WalletService walletService,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.watchlistService = watchlistService;
        this.walletService = walletService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        try {
            // We only support OAuth2 principals with Google profile attributes.
            if (!(authentication.getPrincipal() instanceof DefaultOAuth2User oauthUser)) {
                response.sendRedirect(buildRedirectUrl(null, "oauth_principal_invalid"));
                return;
            }

            String email = oauthUser.getAttribute("email");
            if (!StringUtils.hasText(email)) {
                response.sendRedirect(buildRedirectUrl(null, "email_not_found"));
                return;
            }

            String fullName = oauthUser.getAttribute("name");
            String picture = oauthUser.getAttribute("picture");
            boolean emailVerified = Boolean.TRUE.equals(oauthUser.getAttribute("email_verified"));

            User user = userRepository.findByEmail(email);
            if (user == null) {
                // First Google login: create a local user record.
                user = new User();
                user.setEmail(email);
                user.setFullName(StringUtils.hasText(fullName) ? fullName : email);
                user.setPicture(picture);
                user.setVerified(emailVerified);
                user.setRole(USER_ROLE.ROLE_USER);
                user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                user = userRepository.save(user);
            } else {
                // Existing user: refresh profile details when new data arrives.
                boolean changed = false;
                if (StringUtils.hasText(fullName) && !fullName.equals(user.getFullName())) {
                    user.setFullName(fullName);
                    changed = true;
                }
                if (StringUtils.hasText(picture) && !picture.equals(user.getPicture())) {
                    user.setPicture(picture);
                    changed = true;
                }
                if (emailVerified && !user.isVerified()) {
                    user.setVerified(true);
                    changed = true;
                }
                if (changed) {
                    user = userRepository.save(user);
                }
            }

            ensureUserResources(user);

            // Build JWT directly from local user role and redirect to frontend.
            UsernamePasswordAuthenticationToken jwtAuth =
                    new UsernamePasswordAuthenticationToken(
                            user.getEmail(),
                            null,
                            List.of(new SimpleGrantedAuthority(user.getRole().name()))
                    );

            String jwt = JwtProvider.generateToken(jwtAuth);
            response.sendRedirect(buildRedirectUrl(jwt, null));
        } catch (Exception exception) {
            LOGGER.warn("OAuth2 login success handler failed", exception);
            response.sendRedirect(buildRedirectUrl(null, "google_login_failed"));
        }
    }

    private void ensureUserResources(User user) {
        try {
            watchlistService.findUserWatchlist(user.getId());
        } catch (Exception ignored) {
            // Create missing watchlist lazily for newly provisioned users.
            watchlistService.createWatchList(user);
        }

        try {
            walletService.getUserWallet(user);
        } catch (Exception ignored) {
            // Wallet service lazy-creates when missing.
        }
    }

    private String buildRedirectUrl(String token, String error) {
        String normalizedFrontendUrl = frontendUrl.endsWith("/")
                ? frontendUrl.substring(0, frontendUrl.length() - 1)
                : frontendUrl;

        // Frontend route that handles OAuth handoff and token storage.
        StringBuilder redirectUrl = new StringBuilder(normalizedFrontendUrl + "/login-with-google");
        if (StringUtils.hasText(token)) {
            redirectUrl.append("?token=")
                    .append(URLEncoder.encode(token, StandardCharsets.UTF_8));
        } else if (StringUtils.hasText(error)) {
            redirectUrl.append("?error=")
                    .append(URLEncoder.encode(error, StandardCharsets.UTF_8));
        }
        return redirectUrl.toString();
    }
}
