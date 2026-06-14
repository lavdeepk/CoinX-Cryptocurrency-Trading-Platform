package com.himanshu.controller;

import com.himanshu.config.JwtProvider;
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
import com.himanshu.utils.OtpUtils;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/auth")
/**
 * REST controller responsible for AuthController endpoints.
 */
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CustomUserServiceImplementation customUserDetailsService;
    private final UserService userService;
    private final WatchlistService watchlistService;
    private final TwoFactorOtpService twoFactorOtpService;
    private final EmailService emailService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            CustomUserServiceImplementation customUserDetailsService,
            UserService userService,
            WatchlistService watchlistService,
            TwoFactorOtpService twoFactorOtpService,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.customUserDetailsService = customUserDetailsService;
        this.userService = userService;
        this.watchlistService = watchlistService;
        this.twoFactorOtpService = twoFactorOtpService;
        this.emailService = emailService;
    }

    /**
     * Registers a new user account and returns a signed JWT.
     */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> registerUser(@RequestBody User signupRequest) throws UserException {
        String email = signupRequest.getEmail();
        String password = signupRequest.getPassword();

        User existingUser = userRepository.findByEmail(email);
        if (existingUser != null) {
            throw new UserException("Email Is Already Used With Another Account");
        }

        User newUser = new User();
        newUser.setEmail(email);
        newUser.setFullName(signupRequest.getFullName());
        newUser.setMobile(signupRequest.getMobile());
        newUser.setPassword(passwordEncoder.encode(password));

        User savedUser = userRepository.save(newUser);
        watchlistService.createWatchList(savedUser);

        Authentication authentication = new UsernamePasswordAuthenticationToken(email, password);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        AuthResponse response = new AuthResponse();
        response.setJwt(JwtProvider.generateToken(authentication));
        response.setMessage("Register Success");

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Signs in a user and optionally triggers OTP-based 2FA.
     */
    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signIn(@RequestBody LoginRequest loginRequest)
            throws UserException, MessagingException {
        String email = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        Authentication authentication = authenticateCredentials(email, password);
        User user = userService.findUserByEmail(email);

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = JwtProvider.generateToken(authentication);

        if (isTwoFactorEnabled(user)) {
            return createTwoFactorAuthResponse(user, jwt);
        }

        AuthResponse response = new AuthResponse();
        response.setMessage("Login Success");
        response.setJwt(jwt);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    private Authentication authenticateCredentials(String email, String password) {
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);

        if (userDetails == null || !passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }

    private boolean isTwoFactorEnabled(User user) {
        TwoFactorAuth twoFactorAuth = user.getTwoFactorAuth();
        return twoFactorAuth != null && twoFactorAuth.isEnabled();
    }

    private ResponseEntity<AuthResponse> createTwoFactorAuthResponse(User user, String jwt)
            throws MessagingException {
        AuthResponse response = new AuthResponse();
        response.setMessage("Two factor authentication enabled");
        response.setTwoFactorAuthEnabled(true);

        String otp = OtpUtils.generateOTP();

        TwoFactorOTP existingTwoFactorOtp = twoFactorOtpService.findByUser(user.getId());
        if (existingTwoFactorOtp != null) {
            twoFactorOtpService.deleteTwoFactorOtp(existingTwoFactorOtp);
        }

        TwoFactorOTP generatedOtpSession = twoFactorOtpService.createTwoFactorOtp(user, otp, jwt);
        emailService.sendVerificationOtpEmail(user.getEmail(), otp);

        response.setSession(generatedOtpSession.getId());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/login/google")
    public void redirectToGoogle(HttpServletResponse response) throws IOException {
        response.sendRedirect("/login/oauth2/authorization/google");
    }

    @GetMapping("/login/oauth2/code/google")
    public User handleGoogleCallback(
            @RequestParam(required = false, name = "code") String code,
            @RequestParam(required = false, name = "state") String state,
            OAuth2AuthenticationToken authentication
    ) {
        String email = authentication.getPrincipal().getAttribute("email");
        String fullName = authentication.getPrincipal().getAttribute("name");

        User user = new User();
        user.setEmail(email);
        user.setFullName(fullName);
        return user;
    }

    @PostMapping("/two-factor/otp/{otp}")
    public ResponseEntity<AuthResponse> verifySignInOtp(
            @PathVariable String otp,
            @RequestParam String id
    ) throws Exception {
        TwoFactorOTP twoFactorOtp = twoFactorOtpService.findById(id);

        if (twoFactorOtpService.verifyTwoFactorOtp(twoFactorOtp, otp)) {
            AuthResponse authResponse = new AuthResponse();
            authResponse.setMessage("Two factor authentication verified");
            authResponse.setTwoFactorAuthEnabled(true);
            authResponse.setJwt(twoFactorOtp.getJwt());
            return new ResponseEntity<>(authResponse, HttpStatus.OK);
        }

        throw new Exception("invalid otp");
    }
}
