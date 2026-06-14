package com.himanshu.controller;

import com.himanshu.model.Coin;
import com.himanshu.model.User;
import com.himanshu.model.Watchlist;
import com.himanshu.service.CoinService;
import com.himanshu.service.UserService;
import com.himanshu.service.WatchlistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
/**
 * REST controller responsible for WatchlistControllerTest endpoints.
 */
class WatchlistControllerTest {

    @Mock
    private WatchlistService watchlistService;
    @Mock
    private UserService userService;
    @Mock
    private CoinService coinService;
    @InjectMocks
    private WatchlistController watchlistController;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(watchlistController, "coinService", coinService);
    }

    @Test
    void getUserWatchlist_shouldReturnWatchlist() throws Exception {
        User user = new User();
        user.setId(7L);
        Watchlist watchlist = new Watchlist();
        watchlist.setId(100L);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(watchlistService.getOrCreateUserWatchlist(user)).thenReturn(watchlist);

        ResponseEntity<Watchlist> response = watchlistController.getUserWatchlist("Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(100L, response.getBody().getId());
    }

    @Test
    void createWatchlist_shouldReturnCreatedWatchlist() throws Exception {
        User user = new User();
        Watchlist watchlist = new Watchlist();
        watchlist.setId(101L);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(watchlistService.createWatchList(user)).thenReturn(watchlist);

        ResponseEntity<Watchlist> response = watchlistController.createWatchlist("Bearer token");

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(101L, response.getBody().getId());
    }

    @Test
    void getWatchlistById_shouldReturnWatchlist() throws Exception {
        Watchlist watchlist = new Watchlist();
        watchlist.setId(33L);
        when(watchlistService.findById(33L)).thenReturn(watchlist);

        ResponseEntity<Watchlist> response = watchlistController.getWatchlistById(33L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(33L, response.getBody().getId());
    }

    @Test
    void addItemToWatchlist_shouldReturnUpdatedWatchlist() throws Exception {
        User user = new User();
        Coin coin = new Coin();
        coin.setId("bitcoin");
        Watchlist watchlist = new Watchlist();
        watchlist.setId(101L);

        when(userService.findUserProfileByJwt("Bearer token")).thenReturn(user);
        when(coinService.findById("bitcoin")).thenReturn(coin);
        when(watchlistService.addItemToWatchlist(coin, user)).thenReturn(watchlist);

        ResponseEntity<Watchlist> response = watchlistController.addItemToWatchlist("Bearer token", "bitcoin");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(101L, response.getBody().getId());
    }
}
