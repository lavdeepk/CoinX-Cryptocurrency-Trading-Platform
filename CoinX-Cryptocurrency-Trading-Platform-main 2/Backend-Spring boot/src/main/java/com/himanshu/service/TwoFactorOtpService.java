package com.himanshu.service;

import com.himanshu.model.TwoFactorOTP;
import com.himanshu.model.User;

/**
 * Service contract for TwoFactorOtpService operations.
 */
public interface TwoFactorOtpService {

    TwoFactorOTP createTwoFactorOtp(User user, String otp, String jwt);

    TwoFactorOTP findByUser(Long userId);

    TwoFactorOTP findById(String id);

    boolean verifyTwoFactorOtp(TwoFactorOTP twoFactorOtp,String otp);

    void deleteTwoFactorOtp(TwoFactorOTP twoFactorOTP);

}
