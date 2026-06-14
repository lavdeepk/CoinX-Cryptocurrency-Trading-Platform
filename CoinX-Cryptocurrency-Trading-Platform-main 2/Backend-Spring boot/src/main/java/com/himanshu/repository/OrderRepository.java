package com.himanshu.repository;

import com.himanshu.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository abstraction for OrderRepository persistence operations.
 */
public interface OrderRepository extends JpaRepository<Order,Long> {

    public List<Order>findByUserId(Long userId);
}
