package com.himanshu.service.impl;

import com.himanshu.exception.WalletException;
import com.himanshu.model.Order;
import com.himanshu.model.User;
import com.himanshu.model.Wallet;
import com.himanshu.model.WalletTransaction;
import com.himanshu.model.enums.OrderType;
import com.himanshu.model.enums.WalletTransactionType;
import com.himanshu.repository.WalletRepository;
import com.himanshu.repository.WalletTransactionRepository;
import com.himanshu.service.WalletService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
/**
 * Service implementation that contains business logic for WalletServiceImplementation.
 */
public class WalletServiceImplementation implements WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    public WalletServiceImplementation(
            WalletRepository walletRepository,
            WalletTransactionRepository walletTransactionRepository
    ) {
        this.walletRepository = walletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
    }

    private Wallet createWalletForUser(User user) {
        Wallet wallet = new Wallet();
        wallet.setUser(user);
        return walletRepository.save(wallet);
    }

    @Override
    public Wallet getUserWallet(User user) throws WalletException {
        Wallet wallet = walletRepository.findByUserId(user.getId());
        return wallet != null ? wallet : createWalletForUser(user);
    }

    @Override
    public Wallet findWalletById(Long id) throws WalletException {
        return walletRepository.findById(id)
                .orElseThrow(() -> new WalletException("Wallet not found with id " + id));
    }

    @Override
    public Wallet walletToWalletTransfer(User sender, Wallet receiverWallet, Long amount) throws WalletException {
        if (amount == null || amount <= 0) {
            throw new WalletException("Transfer amount must be greater than zero");
        }

        Wallet senderWallet = getUserWallet(sender);
        BigDecimal transferAmount = BigDecimal.valueOf(amount);

        if (senderWallet.getBalance().compareTo(transferAmount) < 0) {
            throw new WalletException("Insufficient balance...");
        }

        senderWallet.setBalance(senderWallet.getBalance().subtract(transferAmount));
        receiverWallet.setBalance(receiverWallet.getBalance().add(transferAmount));

        walletRepository.save(senderWallet);
        walletRepository.save(receiverWallet);

        return senderWallet;
    }

    @Override
    public Wallet payOrderPayment(Order order, User user) throws WalletException {
        Wallet wallet = getUserWallet(user);
        BigDecimal orderPrice = order.getPrice();

        WalletTransaction transaction = new WalletTransaction();
        transaction.setWallet(wallet);
        transaction.setPurpose(order.getOrderType() + " " + order.getOrderItem().getCoin().getId());
        transaction.setDate(LocalDate.now());
        transaction.setTransferId(order.getOrderItem().getCoin().getSymbol());

        if (OrderType.BUY.equals(order.getOrderType())) {
            if (wallet.getBalance().compareTo(orderPrice) < 0) {
                throw new WalletException("Insufficient funds for this transaction.");
            }

            wallet.setBalance(wallet.getBalance().subtract(orderPrice));
            transaction.setType(WalletTransactionType.BUY_ASSET);
            transaction.setAmount(-orderPrice.longValue());
        } else if (OrderType.SELL.equals(order.getOrderType())) {
            wallet.setBalance(wallet.getBalance().add(orderPrice));
            transaction.setType(WalletTransactionType.SELL_ASSET);
            transaction.setAmount(orderPrice.longValue());
        }

        walletTransactionRepository.save(transaction);
        walletRepository.save(wallet);
        return wallet;
    }

    @Override
    public Wallet addBalanceToWallet(Wallet wallet, Long money) throws WalletException {
        if (money == null || money <= 0) {
            throw new WalletException("Amount must be greater than zero");
        }

        wallet.setBalance(wallet.getBalance().add(BigDecimal.valueOf(money)));
        return walletRepository.save(wallet);
    }
}
