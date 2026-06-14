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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
/**
 * REST controller responsible for WalletController endpoints.
 */
public class WalletController {

    private final WalletService walletService;
    private final UserService userService;
    private final OrderService orderService;
    private final WalletTransactionService walletTransactionService;
    private final PaymentService paymentService;

    public WalletController(
            WalletService walletService,
            UserService userService,
            OrderService orderService,
            WalletTransactionService walletTransactionService,
            PaymentService paymentService
    ) {
        this.walletService = walletService;
        this.userService = userService;
        this.orderService = orderService;
        this.walletTransactionService = walletTransactionService;
        this.paymentService = paymentService;
    }

    @GetMapping("/api/wallet")
    public ResponseEntity<Wallet> getUserWallet(@RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        Wallet wallet = walletService.getUserWallet(user);

        return new ResponseEntity<>(wallet, HttpStatus.OK);
    }

    @GetMapping("/api/wallet/transactions")
    public ResponseEntity<List<WalletTransaction>> getWalletTransactions(
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        Wallet wallet = walletService.getUserWallet(user);
        List<WalletTransaction> transactions = walletTransactionService.getTransactions(wallet, null);

        return new ResponseEntity<>(transactions, HttpStatus.OK);
    }

    /**
     * Simple manual deposit endpoint used by the current UI flow.
     */
    @PutMapping("/api/wallet/deposit/amount/{amount}")
    public ResponseEntity<PaymentResponse> depositMoney(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Long amount
    ) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        Wallet wallet = walletService.getUserWallet(user);

        PaymentResponse response = new PaymentResponse();
        response.setPayment_url("deposite success");
        walletService.addBalanceToWallet(wallet, amount);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/api/wallet/deposit")
    public ResponseEntity<Wallet> addMoneyToWallet(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(name = "order_id") Long orderId,
            @RequestParam(name = "payment_id") String paymentId
    ) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        Wallet wallet = walletService.getUserWallet(user);

        PaymentOrder order = paymentService.getPaymentOrderById(orderId);
        boolean isProcessed = paymentService.processPaymentOrder(order, paymentId);

        if (isProcessed) {
            wallet = walletService.addBalanceToWallet(wallet, order.getAmount());
        }

        return new ResponseEntity<>(wallet, HttpStatus.OK);
    }

    @PutMapping("/api/wallet/{walletId}/transfer")
    public ResponseEntity<Wallet> walletToWalletTransfer(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Long walletId,
            @RequestBody WalletTransaction request
    ) throws Exception {
        User senderUser = userService.findUserProfileByJwt(jwt);
        Wallet receiverWallet = walletService.findWalletById(walletId);

        Wallet senderWallet = walletService.walletToWalletTransfer(senderUser, receiverWallet, request.getAmount());
        walletTransactionService.createTransaction(
                senderWallet,
                WalletTransactionType.WALLET_TRANSFER,
                receiverWallet.getId().toString(),
                request.getPurpose(),
                -request.getAmount()
        );

        return new ResponseEntity<>(senderWallet, HttpStatus.OK);
    }

    @PutMapping("/api/wallet/order/{orderId}/pay")
    public ResponseEntity<Wallet> payOrderPayment(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        Order order = orderService.getOrderById(orderId);

        Wallet wallet = walletService.payOrderPayment(order, user);

        return new ResponseEntity<>(wallet, HttpStatus.OK);
    }
}
