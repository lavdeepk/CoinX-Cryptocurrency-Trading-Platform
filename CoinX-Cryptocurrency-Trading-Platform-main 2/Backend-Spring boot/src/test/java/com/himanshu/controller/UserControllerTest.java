package com.himanshu.controller;

import com.himanshu.model.ForgotPasswordToken;
import com.himanshu.model.User;
import com.himanshu.model.VerificationCode;
import com.himanshu.model.enums.VerificationType;
import com.himanshu.request.ResetPasswordRequest;
import com.himanshu.request.UpdatePasswordRequest;
import com.himanshu.response.ApiResponse;
import com.himanshu.response.AuthResponse;
import com.himanshu.service.EmailService;
import com.himanshu.service.ForgotPasswordService;
import com.himanshu.service.UserService;
import com.himanshu.service.VerificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
/**
 * REST controller responsible for UserControllerTest endpoints.
 */
class UserControllerTest {

    @Mock
    private UserService userService;
    @Mock
    private VerificationService verificationService;
    @Mock
    private ForgotPasswordService forgotPasswordService;
    @Mock
    private EmailService emailService;
    @InjectMocks
    private UserController userController;

    @Test
    void getUserProfileHandler_shouldReturnAcceptedAndHidePassword() throws Exception {
        User user = new User();
        user.setEmail("user@example.com");
        user.setPassword("secret");
        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);

        ResponseEntity<User> response = userController.getUserProfileHandler("Bearer token");

        assertEquals(HttpStatus.ACCEPTED, response.getStatusCode());
        assertEquals("user@example.com", response.getBody().getEmail());
        assertNull(response.getBody().getPassword());
    }

    @Test
    void findUserById_shouldReturnAcceptedAndHidePassword() throws Exception {
        User user = new User();
        user.setId(10L);
        user.setPassword("secret");
        when(userService.findUserById(10L)).thenReturn(user);

        ResponseEntity<User> response = userController.findUserById(10L, "Bearer token");

        assertEquals(HttpStatus.ACCEPTED, response.getStatusCode());
        assertEquals(10L, response.getBody().getId());
        assertNull(response.getBody().getPassword());
    }

    @Test
    void findUserByEmail_shouldReturnAccepted() throws Exception {
        User user = new User();
        user.setEmail("abc@example.com");
        when(userService.findUserByEmail("abc@example.com")).thenReturn(user);

        ResponseEntity<User> response = userController.findUserByEmail("abc@example.com", "Bearer token");

        assertEquals(HttpStatus.ACCEPTED, response.getStatusCode());
        assertEquals("abc@example.com", response.getBody().getEmail());
    }

    @Test
    void enabledTwoFactorAuthentication_shouldReturnUpdatedUserWhenOtpIsValid() throws Exception {
        User user = new User();
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setVerificationType(VerificationType.EMAIL);
        verificationCode.setEmail("user@example.com");
        User updatedUser = new User();
        updatedUser.setEmail("user@example.com");

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(verificationService.findUsersVerification(user)).thenReturn(verificationCode);
        when(verificationService.VerifyOtp("123456", verificationCode)).thenReturn(true);
        when(userService.enabledTwoFactorAuthentication(VerificationType.EMAIL, "user@example.com", user))
                .thenReturn(updatedUser);

        ResponseEntity<User> response = userController.enabledTwoFactorAuthentication("Bearer token", "123456");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("user@example.com", response.getBody().getEmail());
        verify(verificationService).deleteVerification(verificationCode);
    }

    @Test
    void resetPassword_shouldUpdatePasswordWhenOtpValid() throws Exception {
        User user = new User();
        ForgotPasswordToken token = new ForgotPasswordToken();
        token.setId("session-1");
        token.setUser(user);

        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setOtp("111111");
        req.setPassword("new-pass");

        when(forgotPasswordService.findById("session-1")).thenReturn(token);
        when(forgotPasswordService.verifyToken(token, "111111")).thenReturn(true);

        ResponseEntity<ApiResponse> response = userController.resetPassword("session-1", req);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("password updated successfully", response.getBody().getMessage());
        verify(userService).updatePassword(user, "new-pass");
    }

    @Test
    void sendUpdatePasswordOTP_shouldCreateTokenAndSendEmail() throws Exception {
        User user = new User();
        user.setId(5L);
        user.setEmail("user@example.com");

        UpdatePasswordRequest req = new UpdatePasswordRequest();
        req.setSendTo("user@example.com");
        req.setVerificationType(VerificationType.EMAIL);

        ForgotPasswordToken token = new ForgotPasswordToken();
        token.setId("forgot-session");
        token.setOtp("654321");

        when(userService.findUserByEmail("user@example.com")).thenReturn(user);
        when(forgotPasswordService.findByUser(5L)).thenReturn(null);
        when(forgotPasswordService.createToken(eq(user), anyString(), anyString(), eq(VerificationType.EMAIL), eq("user@example.com")))
                .thenReturn(token);

        ResponseEntity<AuthResponse> response = userController.sendUpdatePasswordOTP(req);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("forgot-session", response.getBody().getSession());
        assertEquals("Password Reset OTP sent successfully.", response.getBody().getMessage());
        verify(emailService).sendVerificationOtpEmail("user@example.com", "654321");
    }

    @Test
    void verifyOTP_shouldReturnVerifiedUserWhenOtpIsValid() throws Exception {
        User user = new User();
        VerificationCode verificationCode = new VerificationCode();
        User verifiedUser = new User();
        verifiedUser.setVerified(true);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(verificationService.findUsersVerification(user)).thenReturn(verificationCode);
        when(verificationService.VerifyOtp("999999", verificationCode)).thenReturn(true);
        when(userService.verifyUser(user)).thenReturn(verifiedUser);

        ResponseEntity<User> response = userController.verifyOTP("Bearer token", "999999");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(true, response.getBody().isVerified());
        verify(verificationService).deleteVerification(verificationCode);
    }

    @Test
    void sendVerificationOTP_shouldSendEmailWhenVerificationTypeIsEmail() throws Exception {
        User user = new User();
        user.setEmail("user@example.com");
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setOtp("777777");

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(verificationService.findUsersVerification(user)).thenReturn(null);
        when(verificationService.sendVerificationOTP(user, VerificationType.EMAIL)).thenReturn(verificationCode);

        ResponseEntity<String> response = userController.sendVerificationOTP(VerificationType.EMAIL, "Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Verification OTP sent successfully.", response.getBody());
        verify(emailService).sendVerificationOtpEmail("user@example.com", "777777");
    }
}
