package com.himanshu.service;

import com.himanshu.model.PaymentDetails;
import com.himanshu.model.User;

/**
 * Service contract for PaymentDetailsService operations.
 */
public interface PaymentDetailsService {
    public PaymentDetails addPaymentDetails( String accountNumber,
                                             String accountHolderName,
                                             String ifsc,
                                             String bankName,
                                             User user
    );

    public PaymentDetails getUsersPaymentDetails(User user);


}
