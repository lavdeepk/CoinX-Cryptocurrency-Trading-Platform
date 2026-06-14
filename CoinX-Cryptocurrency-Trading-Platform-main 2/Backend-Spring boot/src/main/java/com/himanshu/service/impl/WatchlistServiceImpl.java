package com.himanshu.service.impl;

import com.himanshu.model.Coin;
import com.himanshu.model.User;
import com.himanshu.model.Watchlist;
import com.himanshu.repository.WatchlistRepository;
import com.himanshu.service.WatchlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
/**
 * Service implementation that contains business logic for WatchlistServiceImpl.
 */
@Transactional
public class WatchlistServiceImpl implements WatchlistService {
    @Autowired
    private WatchlistRepository watchlistRepository;


    @Override
    public Watchlist findUserWatchlist(Long userId) throws Exception {
        Watchlist watchlist=watchlistRepository.findByUserId(userId);
        if(watchlist==null){
            throw new Exception("watch not found");
        }
        return watchlist;
    }

    @Override
    public Watchlist getOrCreateUserWatchlist(User user) {
        Watchlist watchlist = watchlistRepository.findByUserId(user.getId());
        if (watchlist != null) {
            return watchlist;
        }
        return createWatchList(user);
    }

    @Override
    public Watchlist createWatchList(User user) {
        Watchlist existingWatchlist = watchlistRepository.findByUserId(user.getId());
        if (existingWatchlist != null) {
            return existingWatchlist;
        }
        Watchlist watchlist=new Watchlist();
        watchlist.setUser(user);
        return watchlistRepository.save(watchlist);
    }

    @Override
    public Watchlist findById(Long id) throws Exception {
        Optional<Watchlist> optionalWatchlist = watchlistRepository.findById(id);
        if(optionalWatchlist.isEmpty()){
            throw new Exception("watch list not found");
        }
        return optionalWatchlist.get();
    }

    @Override
    public Watchlist addItemToWatchlist(Coin coin,User user) {
        Watchlist watchlist = getOrCreateUserWatchlist(user);

        boolean removed = watchlist.getCoins().removeIf(existingCoin ->
                existingCoin != null && existingCoin.getId() != null && existingCoin.getId().equals(coin.getId()));

        if (!removed) {
            watchlist.getCoins().add(coin);
        }

        return watchlistRepository.save(watchlist);
    }
}
