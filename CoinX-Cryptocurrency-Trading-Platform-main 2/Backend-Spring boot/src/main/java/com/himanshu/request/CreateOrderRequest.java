package com.himanshu.request;

import com.himanshu.model.enums.OrderType;

import lombok.Data;



@Data
/**
 * Request DTO used by CreateOrderRequest APIs.
 */
public class CreateOrderRequest {
    private String coinId;
    private double quantity;
    private OrderType orderType;
}
