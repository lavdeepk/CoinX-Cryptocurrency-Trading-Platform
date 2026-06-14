package com.himanshu.controller;

import com.himanshu.model.PaymentDetails;
import com.himanshu.model.User;
import com.himanshu.service.PaymentDetailsService;
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
 * REST controller responsible for PaymentDetailsControllerTest endpoints.
 */
class PaymentDetailsControllerTest {

    @Mock
    private UserService userService;
    @Mock
    private PaymentDetailsService paymentDetailsService;
    @InjectMocks
    private PaymentDetailsController paymentDetailsController;

    @Test
    void addPaymentDetails_shouldReturnCreatedDetails() throws Exception {
        User user = new User();
        user.setId(1L);
        PaymentDetails req = new PaymentDetails();
        req.setAccountNumber("123");
        req.setAccountHolderName("John");
        req.setIfsc("IFSC1");
        req.setBankName("Bank");
        PaymentDetails created = new PaymentDetails();
        created.setId(9L);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(paymentDetailsService.addPaymentDetails("123", "John", "IFSC1", "Bank", user)).thenReturn(created);

        ResponseEntity<PaymentDetails> response = paymentDetailsController.addPaymentDetails(req, "Bearer token");

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(9L, response.getBody().getId());
    }

    @Test
    void getUsersPaymentDetails_shouldReturnPaymentDetails() throws Exception {
        User user = new User();
        PaymentDetails details = new PaymentDetails();
        details.setId(15L);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(paymentDetailsService.getUsersPaymentDetails(user)).thenReturn(details);

        ResponseEntity<PaymentDetails> response = paymentDetailsController.getUsersPaymentDetails("Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(15L, response.getBody().getId());
    }
}
