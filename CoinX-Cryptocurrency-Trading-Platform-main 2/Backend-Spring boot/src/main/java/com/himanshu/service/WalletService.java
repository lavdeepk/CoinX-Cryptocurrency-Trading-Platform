package com.himanshu.service;


import com.himanshu.exception.WalletException;
import com.himanshu.model.Order;
import com.himanshu.model.User;
import com.himanshu.model.Wallet;


/**
 * Service contract for WalletService operations.
 */
public interface WalletService {


    Wallet getUserWallet(User user) throws WalletException;

    public Wallet addBalanceToWallet(Wallet wallet, Long money) throws WalletException;

    public Wallet findWalletById(Long id) throws WalletException;

    public Wallet walletToWalletTransfer(User sender,Wallet receiverWallet, Long amount) throws WalletException;

    public Wallet payOrderPayment(Order order, User user) throws WalletException;



}
