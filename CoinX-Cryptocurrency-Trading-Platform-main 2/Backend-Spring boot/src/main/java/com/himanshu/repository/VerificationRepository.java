package com.himanshu.repository;

import com.himanshu.model.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository abstraction for VerificationRepository persistence operations.
 */
public interface VerificationRepository extends JpaRepository<VerificationCode,Long> {
    VerificationCode findByUserId(Long userId);
}
