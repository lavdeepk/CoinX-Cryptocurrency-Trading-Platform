package com.himanshu.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.himanshu.response.CoinPageResponse;
import com.himanshu.service.CoinService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/coins")
/**
 * REST controller responsible for CoinController endpoints.
 */
public class CoinController {

    private static final int DEFAULT_PAGE = 1;
    private static final int DEFAULT_SIZE = 10;
    private static final int MAX_SIZE = 50;

    private final CoinService coinService;
    private final ObjectMapper objectMapper;

    public CoinController(CoinService coinService, ObjectMapper objectMapper) {
        this.coinService = coinService;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public ResponseEntity<CoinPageResponse> getCoinList(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) throws Exception {
        int normalizedPage = Math.max(page, DEFAULT_PAGE);
        int normalizedSize = size <= 0 ? DEFAULT_SIZE : Math.min(size, MAX_SIZE);
        CoinPageResponse coinPage = coinService.getCoinList(normalizedPage, normalizedSize);
        return new ResponseEntity<>(coinPage, HttpStatus.OK);
    }

    @GetMapping("/{coinId}/chart")
    public ResponseEntity<JsonNode> getMarketChart(
            @PathVariable String coinId,
            @RequestParam("days") int days
    ) throws Exception {
        String marketChart = coinService.getMarketChart(coinId, days);
        JsonNode jsonNode = objectMapper.readTree(marketChart);
        return ResponseEntity.ok(jsonNode);
    }

    @GetMapping("/search")
    public ResponseEntity<JsonNode> searchCoin(@RequestParam("q") String keyword) throws JsonProcessingException {
        String searchResponse = coinService.searchCoin(keyword);
        JsonNode jsonNode = objectMapper.readTree(searchResponse);
        return ResponseEntity.ok(jsonNode);
    }

    @GetMapping("/top50")
    public ResponseEntity<JsonNode> getTop50CoinByMarketCapRank() throws JsonProcessingException {
        String topCoins = coinService.getTop50CoinsByMarketCapRank();
        JsonNode jsonNode = objectMapper.readTree(topCoins);
        return ResponseEntity.ok(jsonNode);
    }

    @GetMapping("/trading")
    public ResponseEntity<JsonNode> getTrendingCoins() throws JsonProcessingException {
        String trendingCoins = coinService.getTrendingCoins();
        JsonNode jsonNode = objectMapper.readTree(trendingCoins);
        return ResponseEntity.ok(jsonNode);
    }

    @GetMapping("/trending-assets")
    public ResponseEntity<JsonNode> getTrendingAssets(
            @RequestParam(value = "limit", defaultValue = "10") int limit
    ) throws JsonProcessingException {
        String trendingAssets = coinService.getTrendingAssets(limit);
        JsonNode jsonNode = objectMapper.readTree(trendingAssets);
        return ResponseEntity.ok(jsonNode);
    }

    @GetMapping("/details/{coinId}")
    public ResponseEntity<JsonNode> getCoinDetails(@PathVariable String coinId) throws JsonProcessingException {
        String coinDetails = coinService.getCoinDetails(coinId);
        JsonNode jsonNode = objectMapper.readTree(coinDetails);
        return ResponseEntity.ok(jsonNode);
    }
}
