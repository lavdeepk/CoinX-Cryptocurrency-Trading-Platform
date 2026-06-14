package com.himanshu.repository;

import com.himanshu.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository abstraction for WalletRepository persistence operations.
 */
public interface WalletRepository extends JpaRepository<Wallet,Long> {

    public Wallet findByUserId(Long userId);


}
