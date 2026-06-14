package com.himanshu.service;

import com.himanshu.model.Coin;
import com.himanshu.model.User;
import com.himanshu.model.Watchlist;

/**
 * Service contract for WatchlistService operations.
 */
public interface WatchlistService {

    Watchlist findUserWatchlist(Long userId) throws Exception;

    Watchlist getOrCreateUserWatchlist(User user);

    Watchlist createWatchList(User user);

    Watchlist findById(Long id) throws Exception;

    Watchlist addItemToWatchlist(Coin coin,User user) throws Exception;
}
