package com.himanshu.repository;

import com.himanshu.model.Withdrawal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository abstraction for WithdrawalRepository persistence operations.
 */
public interface WithdrawalRepository extends JpaRepository<Withdrawal,Long> {
    List<Withdrawal> findByUserId(Long userId);
}
