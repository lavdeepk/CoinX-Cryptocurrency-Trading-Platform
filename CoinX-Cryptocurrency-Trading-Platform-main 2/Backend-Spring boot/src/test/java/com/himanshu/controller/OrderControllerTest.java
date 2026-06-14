package com.himanshu.controller;

import com.himanshu.model.Coin;
import com.himanshu.model.Order;
import com.himanshu.model.User;
import com.himanshu.model.enums.OrderType;
import com.himanshu.request.CreateOrderRequest;
import com.himanshu.service.CoinService;
import com.himanshu.service.OrderService;
import com.himanshu.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
/**
 * REST controller responsible for OrderControllerTest endpoints.
 */
class OrderControllerTest {

    @Mock
    private OrderService orderService;

    @Mock
    private UserService userService;

    @Mock
    private CoinService coinService;

    @InjectMocks
    private OrderController orderController;

    @Test
    void payOrderPayment_shouldProcessOrder() throws Exception {
        User user = new User();
        user.setId(1L);

        Coin coin = new Coin();
        coin.setId("bitcoin");

        Order order = new Order();
        order.setId(99L);

        CreateOrderRequest request = new CreateOrderRequest();
        request.setCoinId("bitcoin");
        request.setOrderType(OrderType.BUY);
        request.setQuantity(2.0);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(coinService.findById("bitcoin")).thenReturn(coin);
        when(orderService.processOrder(coin, 2.0, OrderType.BUY, user)).thenReturn(order);

        ResponseEntity<Order> response = orderController.payOrderPayment("Bearer token", request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(99L, response.getBody().getId());
    }

    @Test
    void getOrderById_shouldThrowWhenTokenMissing() {
        Exception ex = assertThrows(Exception.class, () -> orderController.getOrderById(null, 10L));
        assertEquals("token missing...", ex.getMessage());
    }

    @Test
    void getOrderById_shouldReturnForbiddenForDifferentUser() throws Exception {
        User requestUser = new User();
        requestUser.setId(1L);

        User orderOwner = new User();
        orderOwner.setId(2L);

        Order order = new Order();
        order.setUser(orderOwner);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(requestUser);
        when(orderService.getOrderById(10L)).thenReturn(order);

        ResponseEntity<Order> response = orderController.getOrderById("Bearer token", 10L);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void getOrderById_shouldReturnOrderForOwner() throws Exception {
        User requestUser = new User();
        requestUser.setId(3L);

        User owner = new User();
        owner.setId(3L);

        Order order = new Order();
        order.setUser(owner);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(requestUser);
        when(orderService.getOrderById(12L)).thenReturn(order);

        ResponseEntity<Order> response = orderController.getOrderById("Bearer token", 12L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(order, response.getBody());
    }

    @Test
    void getAllOrdersForUser_shouldReturnUserOrders() throws Exception {
        User user = new User();
        user.setId(5L);

        Order order = new Order();
        order.setId(20L);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(orderService.getAllOrdersForUser(5L, "BUY", "BTC")).thenReturn(List.of(order));

        ResponseEntity<List<Order>> response = orderController.getAllOrdersForUser("Bearer token", "BUY", "BTC");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals(20L, response.getBody().get(0).getId());
    }
}
