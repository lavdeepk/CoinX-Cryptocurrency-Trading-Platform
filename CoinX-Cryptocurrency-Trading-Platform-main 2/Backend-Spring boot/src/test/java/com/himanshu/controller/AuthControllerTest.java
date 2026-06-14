package com.himanshu.controller;

import com.himanshu.exception.UserException;
import com.himanshu.model.TwoFactorAuth;
import com.himanshu.model.TwoFactorOTP;
import com.himanshu.model.User;
import com.himanshu.repository.UserRepository;
import com.himanshu.request.LoginRequest;
import com.himanshu.response.AuthResponse;
import com.himanshu.service.EmailService;
import com.himanshu.service.TwoFactorOtpService;
import com.himanshu.service.UserService;
import com.himanshu.service.WatchlistService;
import com.himanshu.service.impl.CustomUserServiceImplementation;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
/**
 * REST controller responsible for AuthControllerTest endpoints.
 */
class AuthControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private CustomUserServiceImplementation customUserDetails;

    @Mock
    private UserService userService;

    @Mock
    private WatchlistService watchlistService;

    @Mock
    private TwoFactorOtpService twoFactorOtpService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthController authController;

    @Test
    void registerUser_shouldCreateUserAndReturnToken() throws Exception {
        User request = new User();
        request.setEmail("new@example.com");
        request.setPassword("secret");
        request.setFullName("New User");
        request.setMobile("9999999999");

        User saved = new User();
        saved.setId(1L);
        saved.setEmail("new@example.com");

        when(userRepository.findByEmail("new@example.com")).thenReturn(null);
        when(passwordEncoder.encode("secret")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenReturn(saved);

        ResponseEntity<AuthResponse> response = authController.registerUser(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Register Success", response.getBody().getMessage());
        assertNotNull(response.getBody().getJwt());
        verify(watchlistService).createWatchList(saved);
    }

    @Test
    void registerUser_shouldThrowIfEmailAlreadyExists() {
        User request = new User();
        request.setEmail("existing@example.com");
        when(userRepository.findByEmail("existing@example.com")).thenReturn(new User());

        assertThrows(UserException.class, () -> authController.registerUser(request));
    }

    @Test
    void signIn_shouldReturnJwtWhenTwoFactorDisabled() throws Exception {
        LoginRequest loginRequest = new LoginRequest("user@example.com", "secret");
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                "user@example.com", "encoded-pass", java.util.List.of()
        );
        User user = new User();
        user.setEmail("user@example.com");
        user.setTwoFactorAuth(new TwoFactorAuth());
        user.getTwoFactorAuth().setEnabled(false);

        when(customUserDetails.loadUserByUsername("user@example.com")).thenReturn(userDetails);
        when(passwordEncoder.matches("secret", "encoded-pass")).thenReturn(true);
        when(userService.findUserByEmail("user@example.com")).thenReturn(user);

        ResponseEntity<AuthResponse> response = authController.signIn(loginRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Login Success", response.getBody().getMessage());
        assertNotNull(response.getBody().getJwt());
        assertFalse(response.getBody().isTwoFactorAuthEnabled());
    }

    @Test
    void signIn_shouldReturnSessionWhenTwoFactorEnabled() throws Exception {
        LoginRequest loginRequest = new LoginRequest("user@example.com", "secret");
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                "user@example.com", "encoded-pass", java.util.List.of()
        );
        User user = new User();
        user.setId(5L);
        user.setEmail("user@example.com");
        user.setTwoFactorAuth(new TwoFactorAuth());
        user.getTwoFactorAuth().setEnabled(true);

        TwoFactorOTP twoFactorOtp = new TwoFactorOTP();
        twoFactorOtp.setId("session-123");

        when(customUserDetails.loadUserByUsername("user@example.com")).thenReturn(userDetails);
        when(passwordEncoder.matches("secret", "encoded-pass")).thenReturn(true);
        when(userService.findUserByEmail("user@example.com")).thenReturn(user);
        when(twoFactorOtpService.findByUser(5L)).thenReturn(null);
        when(twoFactorOtpService.createTwoFactorOtp(eq(user), anyString(), anyString())).thenReturn(twoFactorOtp);

        ResponseEntity<AuthResponse> response = authController.signIn(loginRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Two factor authentication enabled", response.getBody().getMessage());
        assertEquals("session-123", response.getBody().getSession());
        assertTrue(response.getBody().isTwoFactorAuthEnabled());
        verify(emailService).sendVerificationOtpEmail(eq("user@example.com"), anyString());
    }

    @Test
    void verifySignInOtp_shouldReturnJwtWhenOtpIsValid() throws Exception {
        TwoFactorOTP twoFactorOtp = new TwoFactorOTP();
        twoFactorOtp.setId("session-1");
        twoFactorOtp.setJwt("jwt-token");

        when(twoFactorOtpService.findById("session-1")).thenReturn(twoFactorOtp);
        when(twoFactorOtpService.verifyTwoFactorOtp(twoFactorOtp, "123456")).thenReturn(true);

        ResponseEntity<AuthResponse> response = authController.verifySignInOtp("123456", "session-1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("jwt-token", response.getBody().getJwt());
        assertTrue(response.getBody().isTwoFactorAuthEnabled());
    }

    @Test
    void redirectToGoogle_shouldRedirectToOauthEndpoint() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();

        authController.redirectToGoogle(response);

        assertEquals("/login/oauth2/authorization/google", response.getRedirectedUrl());
    }

    @Test
    void handleGoogleCallback_shouldMapOAuthUserData() {
        OAuth2AuthenticationToken authentication = mock(OAuth2AuthenticationToken.class);
        OAuth2User principal = mock(OAuth2User.class);

        when(authentication.getPrincipal()).thenReturn(principal);
        when(principal.getAttribute("email")).thenReturn("google@example.com");
        when(principal.getAttribute("name")).thenReturn("Google User");

        User user = authController.handleGoogleCallback("code", "state", authentication);

        assertEquals("google@example.com", user.getEmail());
        assertEquals("Google User", user.getFullName());
    }
}
