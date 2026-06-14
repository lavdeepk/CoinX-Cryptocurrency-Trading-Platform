package com.himanshu.controller;

import com.himanshu.model.Coin;
import com.himanshu.model.Order;
import com.himanshu.model.User;
import com.himanshu.request.CreateOrderRequest;
import com.himanshu.service.CoinService;
import com.himanshu.service.OrderService;
import com.himanshu.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
/**
 * REST controller responsible for OrderController endpoints.
 */
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;
    private final CoinService coinService;

    public OrderController(OrderService orderService, UserService userService, CoinService coinService) {
        this.orderService = orderService;
        this.userService = userService;
        this.coinService = coinService;
    }

    /**
     * Creates and processes a BUY/SELL order for the authenticated user.
     */
    @PostMapping("/pay")
    public ResponseEntity<Order> payOrderPayment(
            @RequestHeader("Authorization") String jwt,
            @RequestBody CreateOrderRequest request
    ) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        Coin coin = coinService.findById(request.getCoinId());

        Order processedOrder = orderService.processOrder(
                coin,
                request.getQuantity(),
                request.getOrderType(),
                user
        );

        return ResponseEntity.ok(processedOrder);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(
            @RequestHeader("Authorization") String jwtToken,
            @PathVariable Long orderId
    ) throws Exception {
        if (jwtToken == null) {
            throw new Exception("token missing...");
        }

        User authenticatedUser = userService.findUserProfileByJwt(jwtToken);
        Order order = orderService.getOrderById(orderId);

        if (order.getUser().getId().equals(authenticatedUser.getId())) {
            return ResponseEntity.ok(order);
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrdersForUser(
            @RequestHeader("Authorization") String jwtToken,
            @RequestParam(required = false, name = "order_type") String orderType,
            @RequestParam(required = false, name = "asset_symbol") String assetSymbol
    ) throws Exception {
        if (jwtToken == null) {
            throw new Exception("token missing...");
        }

        Long userId = userService.findUserProfileByJwt(jwtToken).getId();
        List<Order> userOrders = orderService.getAllOrdersForUser(userId, orderType, assetSymbol);

        return ResponseEntity.ok(userOrders);
    }
}
