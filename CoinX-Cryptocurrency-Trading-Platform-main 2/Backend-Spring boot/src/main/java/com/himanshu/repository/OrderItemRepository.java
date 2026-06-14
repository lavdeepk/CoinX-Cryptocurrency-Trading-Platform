package com.himanshu.repository;

import com.himanshu.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository abstraction for OrderItemRepository persistence operations.
 */
public interface OrderItemRepository extends JpaRepository<OrderItem,Long> {
}
