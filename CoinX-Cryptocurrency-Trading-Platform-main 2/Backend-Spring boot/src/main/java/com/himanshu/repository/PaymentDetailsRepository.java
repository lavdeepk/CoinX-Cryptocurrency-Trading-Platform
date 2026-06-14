package com.himanshu.repository;

import com.himanshu.model.PaymentDetails;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository abstraction for PaymentDetailsRepository persistence operations.
 */
public interface PaymentDetailsRepository extends JpaRepository<PaymentDetails,Long> {

    PaymentDetails getPaymentDetailsByUserId(Long userId);
}
