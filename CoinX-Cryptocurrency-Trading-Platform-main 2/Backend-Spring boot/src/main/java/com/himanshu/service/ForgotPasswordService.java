package com.himanshu.service;

import com.himanshu.model.enums.VerificationType;
import com.himanshu.model.ForgotPasswordToken;
import com.himanshu.model.User;

/**
 * Service contract for ForgotPasswordService operations.
 */
public interface ForgotPasswordService {

    ForgotPasswordToken createToken(User user, String id, String otp,
                                    VerificationType verificationType,String sendTo);

    ForgotPasswordToken findById(String id);

    ForgotPasswordToken findByUser(Long userId);

    void deleteToken(ForgotPasswordToken token);

    boolean verifyToken(ForgotPasswordToken token,String otp);
}
