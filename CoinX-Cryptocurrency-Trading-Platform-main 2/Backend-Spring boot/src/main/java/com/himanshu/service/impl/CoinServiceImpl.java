package com.himanshu.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.himanshu.model.Coin;
import com.himanshu.repository.CoinRepository;
import com.himanshu.response.CoinPageResponse;
import com.himanshu.service.CoinService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
/**
 * Service implementation that contains business logic for CoinServiceImpl.
 */
public class CoinServiceImpl implements CoinService {

    private static final Logger LOGGER = LoggerFactory.getLogger(CoinServiceImpl.class);
    private static final String COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";
    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 50;
    private static final int DEFAULT_TRENDING_ASSET_LIMIT = 10;
    private static final int MAX_TRENDING_ASSET_LIMIT = 20;

    private final CoinRepository coinRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${coingecko.api.key}")
    private String apiKey;

    public CoinServiceImpl(CoinRepository coinRepository, ObjectMapper objectMapper) {
        this.coinRepository = coinRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public CoinPageResponse getCoinList(int page, int size) throws Exception {
        int normalizedPage = Math.max(page, 1);
        int normalizedSize = size <= 0 ? DEFAULT_PAGE_SIZE : Math.min(size, MAX_PAGE_SIZE);
        int probeSize = Math.min(normalizedSize + 1, MAX_PAGE_SIZE);
        String url = COINGECKO_BASE_URL + "/coins/markets?vs_currency=usd&per_page=" + probeSize + "&page=" + normalizedPage;

        try {
            String responseBody = executeGet(url);
            List<Coin> fetchedCoins = objectMapper.readValue(responseBody, new TypeReference<List<Coin>>() {
            });
            boolean hasNext = fetchedCoins.size() > normalizedSize;
            List<Coin> items = hasNext ? fetchedCoins.subList(0, normalizedSize) : fetchedCoins;

            return new CoinPageResponse(
                    items,
                    normalizedPage,
                    normalizedSize,
                    hasNext,
                    normalizedPage > 1
            );
        } catch (HttpClientErrorException | HttpServerErrorException | JsonProcessingException exception) {
            LOGGER.warn("Failed to fetch coin list for page {} and size {}", normalizedPage, normalizedSize, exception);
            throw new Exception("Please wait a while: you are likely hitting free-plan rate limits.");
        }
    }

    @Override
    public String getMarketChart(String coinId, int days) throws Exception {
        String url = COINGECKO_BASE_URL + "/coins/" + coinId + "/market_chart?vs_currency=usd&days=" + days;

        try {
            return executeGet(url);
        } catch (HttpClientErrorException | HttpServerErrorException exception) {
            LOGGER.warn("Failed to fetch market chart for coin {} and days {}", coinId, days, exception);
            throw new Exception("You are likely hitting free-plan rate limits.");
        }
    }

    @Override
    public String getCoinDetails(String coinId) throws JsonProcessingException {
        String url = COINGECKO_BASE_URL + "/coins/" + coinId;
        String responseBody = executeGet(url);

        JsonNode jsonNode = objectMapper.readTree(responseBody);
        JsonNode marketData = jsonNode.path("market_data");
        JsonNode imageData = jsonNode.path("image");

        Coin coin = new Coin();
        coin.setId(jsonNode.path("id").asText());
        coin.setSymbol(jsonNode.path("symbol").asText());
        coin.setName(jsonNode.path("name").asText());
        coin.setImage(imageData.path("large").asText());
        coin.setCurrentPrice(readUsdDouble(marketData, "current_price"));
        coin.setMarketCap(readUsdLong(marketData, "market_cap"));
        coin.setMarketCapRank(jsonNode.path("market_cap_rank").asInt());
        coin.setTotalVolume(readUsdLong(marketData, "total_volume"));
        coin.setHigh24h(readUsdDouble(marketData, "high_24h"));
        coin.setLow24h(readUsdDouble(marketData, "low_24h"));
        coin.setPriceChange24h(marketData.path("price_change_24h").asDouble());
        coin.setPriceChangePercentage24h(marketData.path("price_change_percentage_24h").asDouble());
        coin.setMarketCapChange24h(marketData.path("market_cap_change_24h").asLong());
        coin.setMarketCapChangePercentage24h(marketData.path("market_cap_change_percentage_24h").asDouble());
        coin.setCirculatingSupply(marketData.path("circulating_supply").asLong());
        coin.setTotalSupply(marketData.path("total_supply").asLong());

        coinRepository.save(coin);
        return responseBody;
    }

    @Override
    public Coin findById(String coinId) throws Exception {
        return coinRepository.findById(coinId)
                .orElseThrow(() -> new Exception("Invalid coin id"));
    }

    @Override
    public String searchCoin(String keyword) {
        String url = COINGECKO_BASE_URL + "/search?query=" + keyword;
        return executeGet(url);
    }

    @Override
    public String getTop50CoinsByMarketCapRank() {
        String url = COINGECKO_BASE_URL + "/coins/markets?vs_currency=usd&page=1&per_page=50";

        try {
            return executeGet(url);
        } catch (HttpClientErrorException | HttpServerErrorException exception) {
            LOGGER.warn("Failed to fetch top 50 coins", exception);
            return null;
        }
    }

    @Override
    public String getTrendingCoins() {
        String url = COINGECKO_BASE_URL + "/search/trending";

        try {
            return executeGet(url);
        } catch (HttpClientErrorException | HttpServerErrorException exception) {
            LOGGER.warn("Failed to fetch trending coins", exception);
            return "{\"coins\":[]}";
        }
    }

    @Override
    public String getTrendingAssets(int limit) {
        int normalizedLimit = limit <= 0
                ? DEFAULT_TRENDING_ASSET_LIMIT
                : Math.min(limit, MAX_TRENDING_ASSET_LIMIT);

        try {
            String trendingResponse = executeGet(COINGECKO_BASE_URL + "/search/trending");
            JsonNode trendingJson = objectMapper.readTree(trendingResponse);
            JsonNode coinsNode = trendingJson.path("coins");

            List<String> ids = new ArrayList<>();
            if (coinsNode.isArray()) {
                for (JsonNode coinNode : coinsNode) {
                    String id = coinNode.path("item").path("id").asText();
                    if (!id.isBlank()) {
                        ids.add(id);
                    }
                    if (ids.size() >= normalizedLimit) {
                        break;
                    }
                }
            }

            if (ids.isEmpty()) {
                return getFallbackTrendingAssets(normalizedLimit);
            }

            String encodedIds = URLEncoder.encode(String.join(",", ids), StandardCharsets.UTF_8);
            String marketsUrl = COINGECKO_BASE_URL
                    + "/coins/markets?vs_currency=usd"
                    + "&ids=" + encodedIds
                    + "&order=market_cap_desc"
                    + "&per_page=" + normalizedLimit
                    + "&page=1"
                    + "&sparkline=false"
                    + "&price_change_percentage=24h";

            String response = executeGet(marketsUrl);
            JsonNode jsonNode = objectMapper.readTree(response);
            if (!jsonNode.isArray() || jsonNode.isEmpty()) {
                return getFallbackTrendingAssets(normalizedLimit);
            }
            return response;
        } catch (HttpClientErrorException | HttpServerErrorException | JsonProcessingException exception) {
            LOGGER.warn("Failed to fetch trending assets", exception);
            return getFallbackTrendingAssets(normalizedLimit);
        }
    }

    private String getFallbackTrendingAssets(int limit) {
        String fallbackUrl = COINGECKO_BASE_URL
                + "/coins/markets?vs_currency=usd"
                + "&order=volume_desc"
                + "&per_page=" + limit
                + "&page=1"
                + "&sparkline=false"
                + "&price_change_percentage=24h";
        try {
            return executeGet(fallbackUrl);
        } catch (HttpClientErrorException | HttpServerErrorException exception) {
            LOGGER.warn("Failed to fetch fallback trending assets", exception);
            return "[]";
        }
    }

    private String executeGet(String url) {
        HttpHeaders headers = new HttpHeaders();
        if (StringUtils.hasText(apiKey)) {
            headers.set("x-cg-demo-api-key", apiKey);
        }

        HttpEntity<String> entity = new HttpEntity<>("parameters", headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        return response.getBody();
    }

    private double readUsdDouble(JsonNode marketData, String fieldName) {
        return marketData.path(fieldName).path("usd").asDouble();
    }

    private long readUsdLong(JsonNode marketData, String fieldName) {
        return marketData.path(fieldName).path("usd").asLong();
    }
}
