package com.himanshu.service;

import com.himanshu.model.enums.WalletTransactionType;
import com.himanshu.model.Wallet;
import com.himanshu.model.WalletTransaction;

import java.util.List;

/**
 * Service contract for WalletTransactionService operations.
 */
public interface WalletTransactionService {
    WalletTransaction createTransaction(Wallet wallet,
                                        WalletTransactionType type,
                                        String transferId,
                                        String purpose,
                                        Long amount
    );

    List<WalletTransaction> getTransactions(Wallet wallet, WalletTransactionType type);

}
