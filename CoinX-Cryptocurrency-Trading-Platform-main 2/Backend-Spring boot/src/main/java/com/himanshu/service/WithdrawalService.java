package com.himanshu.service;

import com.himanshu.model.User;
import com.himanshu.model.Withdrawal;

import java.util.List;

/**
 * Service contract for WithdrawalService operations.
 */
public interface WithdrawalService {

    Withdrawal requestWithdrawal(Long amount,User user);
    Withdrawal procedWithdrawal(Long withdrawalId,boolean accept) throws Exception;
    List<Withdrawal> getUsersWithdrawalHistory(User user);
    List<Withdrawal> getAllWithdrawalRequest();
}
