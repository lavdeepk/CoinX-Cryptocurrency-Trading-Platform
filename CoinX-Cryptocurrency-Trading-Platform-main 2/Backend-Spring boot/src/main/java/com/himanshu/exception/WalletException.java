package com.himanshu.exception;

/**
 * Custom exception type used by WalletException.
 */
public class WalletException extends Exception {

    public WalletException(String message){
        super(message);
    }
}
