package com.himanshu.repository;

import com.himanshu.model.Wallet;
import com.himanshu.model.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository abstraction for WalletTransactionRepository persistence operations.
 */
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction,Long> {

    List<WalletTransaction> findByWalletOrderByDateDesc(Wallet wallet);

}
