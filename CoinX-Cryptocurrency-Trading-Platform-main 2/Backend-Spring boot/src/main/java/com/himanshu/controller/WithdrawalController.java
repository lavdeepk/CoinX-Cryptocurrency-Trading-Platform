package com.himanshu.controller;

import com.himanshu.model.User;
import com.himanshu.model.Wallet;
import com.himanshu.model.Withdrawal;
import com.himanshu.model.enums.WalletTransactionType;
import com.himanshu.service.UserService;
import com.himanshu.service.WalletService;
import com.himanshu.service.WalletTransactionService;
import com.himanshu.service.WithdrawalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
/**
 * REST controller responsible for WithdrawalController endpoints.
 */
public class WithdrawalController {

    private final WithdrawalService withdrawalService;
    private final WalletService walletService;
    private final UserService userService;
    private final WalletTransactionService walletTransactionService;

    public WithdrawalController(
            WithdrawalService withdrawalService,
            WalletService walletService,
            UserService userService,
            WalletTransactionService walletTransactionService
    ) {
        this.withdrawalService = withdrawalService;
        this.walletService = walletService;
        this.userService = userService;
        this.walletTransactionService = walletTransactionService;
    }

    @PostMapping("/api/withdrawal/{amount}")
    public ResponseEntity<Withdrawal> withdrawalRequest(
            @PathVariable Long amount,
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        Wallet userWallet = walletService.getUserWallet(user);

        Withdrawal withdrawal = withdrawalService.requestWithdrawal(amount, user);
        walletService.addBalanceToWallet(userWallet, -withdrawal.getAmount());

        walletTransactionService.createTransaction(
                userWallet,
                WalletTransactionType.WITHDRAWAL,
                null,
                "bank account withdrawal",
                withdrawal.getAmount()
        );

        return new ResponseEntity<>(withdrawal, HttpStatus.OK);
    }

    @PatchMapping("/api/admin/withdrawal/{id}/proceed/{accept}")
    public ResponseEntity<Withdrawal> proceedWithdrawal(
            @PathVariable Long id,
            @PathVariable boolean accept,
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        Withdrawal withdrawal = withdrawalService.procedWithdrawal(id, accept);

        Wallet userWallet = walletService.getUserWallet(user);
        if (!accept) {
            walletService.addBalanceToWallet(userWallet, withdrawal.getAmount());
        }

        return new ResponseEntity<>(withdrawal, HttpStatus.OK);
    }

    @GetMapping("/api/withdrawal")
    public ResponseEntity<List<Withdrawal>> getWithdrawalHistory(
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        List<Withdrawal> userWithdrawalHistory = withdrawalService.getUsersWithdrawalHistory(user);

        return new ResponseEntity<>(userWithdrawalHistory, HttpStatus.OK);
    }

    @GetMapping("/api/admin/withdrawal")
    public ResponseEntity<List<Withdrawal>> getAllWithdrawalRequest(
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        userService.findUserProfileByJwt(jwt);
        List<Withdrawal> allWithdrawalRequests = withdrawalService.getAllWithdrawalRequest();

        return new ResponseEntity<>(allWithdrawalRequests, HttpStatus.OK);
    }
}
