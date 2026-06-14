package com.himanshu.service;

import com.himanshu.model.enums.OrderType;
import com.himanshu.model.Coin;
import com.himanshu.model.Order;
import com.himanshu.model.OrderItem;
import com.himanshu.model.User;


import java.util.List;

/**
 * Service contract for OrderService operations.
 */
public interface OrderService {

    Order createOrder(User user, OrderItem orderItem, OrderType orderType);

    Order getOrderById(Long orderId);

    List<Order> getAllOrdersForUser(Long userId, String orderType,String assetSymbol);

    void cancelOrder(Long orderId);

//    Order buyAsset(CreateOrderRequest req, Long userId, String jwt) throws Exception;

    Order processOrder(Coin coin, double quantity, OrderType orderType, User user) throws Exception;

//    Order sellAsset(CreateOrderRequest req,Long userId,String jwt) throws Exception;


}
