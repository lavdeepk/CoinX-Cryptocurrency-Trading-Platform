package com.himanshu.repository;

import com.himanshu.model.ForgotPasswordToken;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository abstraction for ForgotPasswordRepository persistence operations.
 */
public interface ForgotPasswordRepository extends JpaRepository<ForgotPasswordToken,String> {
    ForgotPasswordToken findByUserId(Long userId);
}
