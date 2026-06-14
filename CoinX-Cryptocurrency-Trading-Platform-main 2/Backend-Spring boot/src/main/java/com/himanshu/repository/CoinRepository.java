package com.himanshu.repository;

import com.himanshu.model.Coin;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository abstraction for CoinRepository persistence operations.
 */
public interface CoinRepository extends JpaRepository<Coin,String> {
}
