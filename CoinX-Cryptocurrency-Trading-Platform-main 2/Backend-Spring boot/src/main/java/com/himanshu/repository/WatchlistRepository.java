package com.himanshu.repository;

import com.himanshu.model.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository abstraction for WatchlistRepository persistence operations.
 */
public interface WatchlistRepository extends JpaRepository<Watchlist,Long> {

    Watchlist findByUserId(Long userId);

}
