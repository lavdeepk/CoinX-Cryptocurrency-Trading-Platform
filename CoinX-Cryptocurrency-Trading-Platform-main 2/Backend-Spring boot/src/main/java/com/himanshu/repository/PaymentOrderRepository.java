package com.himanshu.repository;

import com.himanshu.model.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository abstraction for PaymentOrderRepository persistence operations.
 */
public interface PaymentOrderRepository extends JpaRepository<PaymentOrder,Long> {
}
