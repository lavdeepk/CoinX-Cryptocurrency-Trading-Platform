package com.himanshu.controller;

import com.himanshu.model.User;
import com.himanshu.model.Wallet;
import com.himanshu.model.WalletTransaction;
import com.himanshu.model.Withdrawal;
import com.himanshu.service.UserService;
import com.himanshu.service.WalletService;
import com.himanshu.service.WalletTransactionService;
import com.himanshu.service.WithdrawalService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
/**
 * REST controller responsible for WithdrawalControllerTest endpoints.
 */
class WithdrawalControllerTest {

    @Mock
    private WithdrawalService withdrawalService;
    @Mock
    private WalletService walletService;
    @Mock
    private UserService userService;
    @Mock
    private WalletTransactionService walletTransactionService;
    @InjectMocks
    private WithdrawalController withdrawalController;

    @Test
    void withdrawalRequest_shouldCreateWithdrawalAndDebitWallet() throws Exception {
        User user = new User();
        Wallet wallet = new Wallet();
        Withdrawal withdrawal = new Withdrawal();
        withdrawal.setAmount(400L);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(walletService.getUserWallet(user)).thenReturn(wallet);
        when(withdrawalService.requestWithdrawal(400L, user)).thenReturn(withdrawal);
        when(walletService.addBalanceToWallet(wallet, -400L)).thenReturn(wallet);
        when(walletTransactionService.createTransaction(
                org.mockito.ArgumentMatchers.eq(wallet),
                org.mockito.ArgumentMatchers.eq(com.himanshu.model.enums.WalletTransactionType.WITHDRAWAL),
                org.mockito.ArgumentMatchers.isNull(),
                org.mockito.ArgumentMatchers.eq("bank account withdrawal"),
                org.mockito.ArgumentMatchers.eq(400L)
        )).thenReturn(new WalletTransaction());

        ResponseEntity<?> response = withdrawalController.withdrawalRequest(400L, "Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(withdrawal, response.getBody());
        verify(walletService).addBalanceToWallet(wallet, -400L);
    }

    @Test
    void proceedWithdrawal_shouldRefundWhenDeclined() throws Exception {
        User user = new User();
        Wallet wallet = new Wallet();
        Withdrawal withdrawal = new Withdrawal();
        withdrawal.setAmount(250L);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(withdrawalService.procedWithdrawal(1L, false)).thenReturn(withdrawal);
        when(walletService.getUserWallet(user)).thenReturn(wallet);
        when(walletService.addBalanceToWallet(wallet, 250L)).thenReturn(wallet);

        ResponseEntity<?> response = withdrawalController.proceedWithdrawal(1L, false, "Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(withdrawal, response.getBody());
        verify(walletService).addBalanceToWallet(wallet, 250L);
    }

    @Test
    void proceedWithdrawal_shouldNotRefundWhenAccepted() throws Exception {
        User user = new User();
        Wallet wallet = new Wallet();
        Withdrawal withdrawal = new Withdrawal();
        withdrawal.setAmount(250L);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(withdrawalService.procedWithdrawal(1L, true)).thenReturn(withdrawal);
        when(walletService.getUserWallet(user)).thenReturn(wallet);

        ResponseEntity<?> response = withdrawalController.proceedWithdrawal(1L, true, "Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(withdrawal, response.getBody());
        verify(walletService, never()).addBalanceToWallet(wallet, 250L);
    }

    @Test
    void getWithdrawalHistory_shouldReturnUserHistory() throws Exception {
        User user = new User();
        Withdrawal withdrawal = new Withdrawal();
        withdrawal.setAmount(100L);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(withdrawalService.getUsersWithdrawalHistory(user)).thenReturn(List.of(withdrawal));

        ResponseEntity<List<Withdrawal>> response = withdrawalController.getWithdrawalHistory("Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals(100L, response.getBody().get(0).getAmount());
    }

    @Test
    void getAllWithdrawalRequest_shouldReturnAllRequests() throws Exception {
        User admin = new User();
        Withdrawal withdrawal = new Withdrawal();
        withdrawal.setAmount(600L);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(admin);
        when(withdrawalService.getAllWithdrawalRequest()).thenReturn(List.of(withdrawal));

        ResponseEntity<List<Withdrawal>> response = withdrawalController.getAllWithdrawalRequest("Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals(600L, response.getBody().get(0).getAmount());
    }
}
