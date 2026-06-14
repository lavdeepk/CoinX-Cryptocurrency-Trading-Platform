package com.himanshu.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.himanshu.model.Coin;
import com.himanshu.response.CoinPageResponse;

/**
 * Service contract for CoinService operations.
 */
public interface CoinService {

    CoinPageResponse getCoinList(int page, int size) throws Exception;

    String getMarketChart(String coinId, int days) throws Exception;

    String getCoinDetails(String coinId) throws JsonProcessingException;

    Coin findById(String coinId) throws Exception;

    String searchCoin(String keyword);

    String getTop50CoinsByMarketCapRank();

    String getTrendingCoins();

    String getTrendingAssets(int limit);

    /**
     * Backward-compatible alias for existing callers.
     */
    @Deprecated
    default String getTreadingCoins() {
        return getTrendingCoins();
    }
}
