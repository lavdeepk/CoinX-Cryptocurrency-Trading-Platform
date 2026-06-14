package com.himanshu.service;

import com.himanshu.model.enums.VerificationType;
import com.himanshu.model.User;
import com.himanshu.model.VerificationCode;

/**
 * Service contract for VerificationService operations.
 */
public interface VerificationService {
    VerificationCode sendVerificationOTP(User user, VerificationType verificationType);

    VerificationCode findVerificationById(Long id) throws Exception;

    VerificationCode findUsersVerification(User user) throws Exception;

    Boolean VerifyOtp(String opt, VerificationCode verificationCode);

    void deleteVerification(VerificationCode verificationCode);
}
