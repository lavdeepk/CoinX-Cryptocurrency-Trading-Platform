package com.himanshu.repository;

import com.himanshu.model.TwoFactorOTP;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository abstraction for TwoFactorOtpRepository persistence operations.
 */
public interface TwoFactorOtpRepository extends JpaRepository<TwoFactorOTP,String> {

    TwoFactorOTP findByUserId(Long userId);
}
