package com.himanshu.controller;

import com.himanshu.model.PaymentOrder;
import com.himanshu.model.User;
import com.himanshu.model.enums.PaymentMethod;
import com.himanshu.response.PaymentResponse;
import com.himanshu.service.PaymentService;
import com.himanshu.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
/**
 * REST controller responsible for PaymentControllerTest endpoints.
 */
class PaymentControllerTest {

    @Mock
    private UserService userService;
    @Mock
    private PaymentService paymentService;
    @InjectMocks
    private PaymentController paymentController;

    @Test
    void paymentHandler_shouldCreateRazorpayPaymentLink() throws Exception {
        User user = new User();
        user.setId(1L);
        PaymentOrder order = new PaymentOrder();
        order.setId(11L);
        PaymentResponse paymentResponse = new PaymentResponse();
        paymentResponse.setPayment_url("https://rzp.example");

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(paymentService.createOrder(user, 500L, PaymentMethod.RAZORPAY)).thenReturn(order);
        when(paymentService.createRazorpayPaymentLink(user, 500L, 11L)).thenReturn(paymentResponse);

        ResponseEntity<PaymentResponse> response = paymentController.paymentHandler(
                PaymentMethod.RAZORPAY, 500L, "Bearer token"
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("https://rzp.example", response.getBody().getPayment_url());
    }

    @Test
    void paymentHandler_shouldCreateStripePaymentLink() throws Exception {
        User user = new User();
        user.setId(2L);
        PaymentOrder order = new PaymentOrder();
        order.setId(22L);
        PaymentResponse paymentResponse = new PaymentResponse();
        paymentResponse.setPayment_url("https://stripe.example");

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(paymentService.createOrder(user, 1000L, PaymentMethod.STRIPE)).thenReturn(order);
        when(paymentService.createStripePaymentLink(user, 1000L, 22L)).thenReturn(paymentResponse);

        ResponseEntity<PaymentResponse> response = paymentController.paymentHandler(
                PaymentMethod.STRIPE, 1000L, "Bearer token"
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("https://stripe.example", response.getBody().getPayment_url());
    }
}
