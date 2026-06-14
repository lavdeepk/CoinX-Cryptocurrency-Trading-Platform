package com.himanshu.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.himanshu.model.Coin;
import com.himanshu.response.CoinPageResponse;
import com.himanshu.service.CoinService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
/**
 * REST controller responsible for CoinControllerTest endpoints.
 */
class CoinControllerTest {

    @Mock
    private CoinService coinService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private CoinController coinController;

    @Test
    void getCoinList_shouldReturnCoinList() throws Exception {
        Coin coin = new Coin();
        coin.setId("bitcoin");
        when(coinService.getCoinList(1, 10))
                .thenReturn(new CoinPageResponse(java.util.List.of(coin), 1, 10, true, false));

        ResponseEntity<CoinPageResponse> response = coinController.getCoinList(1, 10);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getItems().size());
        assertEquals("bitcoin", response.getBody().getItems().get(0).getId());
        assertEquals(1, response.getBody().getPage());
        assertEquals(10, response.getBody().getSize());
    }

    @Test
    void getMarketChart_shouldReturnJsonNode() throws Exception {
        when(coinService.getMarketChart("bitcoin", 7)).thenReturn("{\"prices\":[1,2,3]}");

        ResponseEntity<JsonNode> response = coinController.getMarketChart("bitcoin", 7);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().get("prices"));
    }

    @Test
    void searchCoin_shouldReturnJsonNode() throws Exception {
        when(coinService.searchCoin("bit")).thenReturn("[{\"id\":\"bitcoin\"}]");

        ResponseEntity<JsonNode> response = coinController.searchCoin("bit");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("bitcoin", response.getBody().get(0).get("id").asText());
    }

    @Test
    void getTop50CoinByMarketCapRank_shouldReturnJsonNode() throws Exception {
        when(coinService.getTop50CoinsByMarketCapRank()).thenReturn("[{\"symbol\":\"btc\"}]");

        ResponseEntity<JsonNode> response = coinController.getTop50CoinByMarketCapRank();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("btc", response.getBody().get(0).get("symbol").asText());
    }

    @Test
    void getTrendingCoins_shouldReturnJsonNode() throws Exception {
        when(coinService.getTrendingCoins()).thenReturn("[{\"name\":\"Bitcoin\"}]");

        ResponseEntity<JsonNode> response = coinController.getTrendingCoins();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Bitcoin", response.getBody().get(0).get("name").asText());
    }

    @Test
    void getCoinDetails_shouldReturnJsonNode() throws Exception {
        when(coinService.getCoinDetails("bitcoin")).thenReturn("{\"id\":\"bitcoin\",\"name\":\"Bitcoin\"}");

        ResponseEntity<JsonNode> response = coinController.getCoinDetails("bitcoin");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("bitcoin", response.getBody().get("id").asText());
    }
}
