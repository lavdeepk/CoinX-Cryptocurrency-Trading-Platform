package com.himanshu.controller;

import com.himanshu.model.Order;
import com.himanshu.model.PaymentOrder;
import com.himanshu.model.User;
import com.himanshu.model.Wallet;
import com.himanshu.model.WalletTransaction;
import com.himanshu.model.enums.WalletTransactionType;
import com.himanshu.response.PaymentResponse;
import com.himanshu.service.OrderService;
import com.himanshu.service.PaymentService;
import com.himanshu.service.UserService;
import com.himanshu.service.WalletService;
import com.himanshu.service.WalletTransactionService;
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
 * REST controller responsible for WalletControllerTest endpoints.
 */
class WalletControllerTest {

    @Mock
    private WalletService walletService;

    @Mock
    private UserService userService;

    @Mock
    private OrderService orderService;

    @Mock
    private WalletTransactionService walletTransactionService;

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private WalletController walletController;

    @Test
    void getUserWallet_shouldReturnWallet() throws Exception {
        User user = new User();
        Wallet wallet = new Wallet();
        wallet.setId(1L);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(walletService.getUserWallet(user)).thenReturn(wallet);

        ResponseEntity<Wallet> response = walletController.getUserWallet("Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1L, response.getBody().getId());
    }

    @Test
    void getWalletTransactions_shouldReturnTransactions() throws Exception {
        User user = new User();
        Wallet wallet = new Wallet();
        WalletTransaction transaction = new WalletTransaction();
        transaction.setId(10L);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(walletService.getUserWallet(user)).thenReturn(wallet);
        when(walletTransactionService.getTransactions(wallet, null)).thenReturn(List.of(transaction));

        ResponseEntity<List<WalletTransaction>> response = walletController.getWalletTransactions("Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals(10L, response.getBody().get(0).getId());
    }

    @Test
    void depositMoney_shouldAddBalanceAndReturnSuccessUrl() throws Exception {
        User user = new User();
        Wallet wallet = new Wallet();

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(walletService.getUserWallet(user)).thenReturn(wallet);
        when(walletService.addBalanceToWallet(wallet, 500L)).thenReturn(wallet);

        ResponseEntity<PaymentResponse> response = walletController.depositMoney("Bearer token", 500L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("deposite success", response.getBody().getPayment_url());
        verify(walletService).addBalanceToWallet(wallet, 500L);
    }

    @Test
    void addMoneyToWallet_shouldAddBalanceWhenPaymentSuccess() throws Exception {
        User user = new User();
        Wallet wallet = new Wallet();
        Wallet updatedWallet = new Wallet();
        updatedWallet.setId(88L);

        PaymentOrder order = new PaymentOrder();
        order.setId(9L);
        order.setAmount(1000L);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(walletService.getUserWallet(user)).thenReturn(wallet);
        when(paymentService.getPaymentOrderById(9L)).thenReturn(order);
        when(paymentService.processPaymentOrder(order, "pay-1")).thenReturn(true);
        when(walletService.addBalanceToWallet(wallet, 1000L)).thenReturn(updatedWallet);

        ResponseEntity<Wallet> response = walletController.addMoneyToWallet("Bearer token", 9L, "pay-1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(88L, response.getBody().getId());
    }

    @Test
    void addMoneyToWallet_shouldNotAddBalanceWhenPaymentFails() throws Exception {
        User user = new User();
        Wallet wallet = new Wallet();

        PaymentOrder order = new PaymentOrder();
        order.setId(9L);
        order.setAmount(1000L);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(walletService.getUserWallet(user)).thenReturn(wallet);
        when(paymentService.getPaymentOrderById(9L)).thenReturn(order);
        when(paymentService.processPaymentOrder(order, "pay-1")).thenReturn(false);

        ResponseEntity<Wallet> response = walletController.addMoneyToWallet("Bearer token", 9L, "pay-1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(wallet, response.getBody());
        verify(walletService, never()).addBalanceToWallet(wallet, 1000L);
    }

    @Test
    void walletToWalletTransfer_shouldTransferAndCreateTransaction() throws Exception {
        User sender = new User();

        Wallet receiverWallet = new Wallet();
        receiverWallet.setId(22L);

        Wallet senderWallet = new Wallet();

        WalletTransaction request = new WalletTransaction();
        request.setAmount(300L);
        request.setPurpose("gift");

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(sender);
        when(walletService.findWalletById(22L)).thenReturn(receiverWallet);
        when(walletService.walletToWalletTransfer(sender, receiverWallet, 300L)).thenReturn(senderWallet);

        ResponseEntity<Wallet> response = walletController.walletToWalletTransfer("Bearer token", 22L, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(senderWallet, response.getBody());
        verify(walletTransactionService).createTransaction(
                senderWallet,
                WalletTransactionType.WALLET_TRANSFER,
                "22",
                "gift",
                -300L
        );
    }

    @Test
    void payOrderPayment_shouldReturnUpdatedWallet() throws Exception {
        User user = new User();
        Order order = new Order();

        Wallet wallet = new Wallet();
        wallet.setId(501L);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(orderService.getOrderById(77L)).thenReturn(order);
        when(walletService.payOrderPayment(order, user)).thenReturn(wallet);

        ResponseEntity<Wallet> response = walletController.payOrderPayment(77L, "Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(501L, response.getBody().getId());
    }
}
