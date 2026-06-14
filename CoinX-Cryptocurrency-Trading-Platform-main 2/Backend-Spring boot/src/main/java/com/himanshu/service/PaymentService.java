package com.himanshu.service;

import com.himanshu.model.PaymentOrder;
import com.himanshu.model.User;
import com.himanshu.model.enums.PaymentMethod;
import com.himanshu.response.PaymentResponse;
import com.razorpay.RazorpayException;
import com.stripe.exception.StripeException;

/**
 * Service contract for PaymentService operations.
 */
public interface PaymentService {

    PaymentOrder createOrder(User user, Long amount, PaymentMethod paymentMethod);

    PaymentOrder getPaymentOrderById(Long id) throws Exception;

    /**
     * Verifies and updates payment order status with the selected gateway.
     */
    Boolean processPaymentOrder(PaymentOrder paymentOrder, String paymentId) throws RazorpayException;

    /**
     * Backward-compatible alias kept for existing callers.
     */
    @Deprecated
    default Boolean ProccedPaymentOrder(PaymentOrder paymentOrder, String paymentId) throws RazorpayException {
        return processPaymentOrder(paymentOrder, paymentId);
    }

    PaymentResponse createRazorpayPaymentLink(User user, Long amount, Long orderId) throws RazorpayException;

    PaymentResponse createStripePaymentLink(User user, Long amount, Long orderId) throws StripeException;
}
