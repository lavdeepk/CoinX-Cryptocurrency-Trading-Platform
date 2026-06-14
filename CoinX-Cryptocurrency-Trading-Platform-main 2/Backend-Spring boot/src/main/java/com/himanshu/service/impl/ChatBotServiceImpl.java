package com.himanshu.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.himanshu.dto.CoinDTO;
import com.himanshu.model.ChatMessage;
import com.himanshu.response.ApiResponse;
import com.himanshu.service.ChatBotService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;


@Service
/**
 * Service implementation that contains business logic for ChatBotServiceImpl.
 */
public class ChatBotServiceImpl implements ChatBotService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ChatBotServiceImpl.class);

    private static final String GEMINI_ENDPOINT_TEMPLATE =
            "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";
    private static final String COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";
    private static final int CONNECT_TIMEOUT_MS = 4000;
    private static final int READ_TIMEOUT_MS = 30000;
    private static final int GEMINI_MAX_RETRIES = 3;
    private static final long GEMINI_RETRY_BASE_DELAY_MS = 650L;
    private static final int MAX_PROMPT_LENGTH = 2000;
    private static final int MAX_HISTORY_TURNS = 10; // last 10 messages = 5 user+model turns

    /** Crypto-finance persona injected as a system instruction to Gemini. */
    private static final String SYSTEM_INSTRUCTION =
            "You are CoinX AI, a professional cryptocurrency market analyst assistant embedded in the CoinX trading platform.\n"
            + "Your role is to provide clear, data-driven insights about cryptocurrency markets.\n"
            + "\n"
            + "Guidelines:\n"
            + "- Always lead with the current price and 24h change when live data is available.\n"
            + "- Structure responses using concise bullet points (3-6 bullets max) unless the user asks for a longer explanation.\n"
            + "- Use bold for key metrics and coin names.\n"
            + "- Include a brief risk disclaimer at the end when giving buy/sell advice.\n"
            + "- Do NOT make specific price predictions or guarantee returns.\n"
            + "- If a question is unrelated to crypto/finance, politely redirect to crypto topics.\n"
            + "- Keep responses concise and actionable — traders want signal, not noise.";

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String geminiModel;

    @Value("${coingecko.api.key:}")
    private String coinGeckoApiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public ChatBotServiceImpl(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(CONNECT_TIMEOUT_MS);
        requestFactory.setReadTimeout(READ_TIMEOUT_MS);
        this.restTemplate = new RestTemplate(requestFactory);
    }

    // -------------------------------------------------------------------------
    // Gemini API helpers
    // -------------------------------------------------------------------------

    private String geminiApiUrl(String model) {
        return String.format(GEMINI_ENDPOINT_TEMPLATE, model, apiKey);
    }

    private JsonNode executeGeminiCall(JsonNode payload, String model) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<JsonNode> request = new HttpEntity<>(payload, headers);
        ResponseEntity<JsonNode> response =
                restTemplate.exchange(geminiApiUrl(model), HttpMethod.POST, request, JsonNode.class);

        return response.getBody();
    }

    private JsonNode callGemini(JsonNode payload) {
        if (!StringUtils.hasText(apiKey)) {
            throw new IllegalStateException("Gemini API key is not configured.");
        }
        return callGeminiWithRetries(payload, geminiModel);
    }

    private JsonNode callGeminiWithRetries(JsonNode payload, String model) {
        Exception lastException = null;
        for (int attempt = 1; attempt <= GEMINI_MAX_RETRIES; attempt++) {
            try {
                return executeGeminiCall(payload, model);
            } catch (Exception exception) {
                lastException = exception;
                boolean canRetry = isRetryableGeminiException(exception) && attempt < GEMINI_MAX_RETRIES;
                if (!canRetry) {
                    break;
                }

                long delayMs = GEMINI_RETRY_BASE_DELAY_MS * attempt;
                LOGGER.warn(
                        "gemini_retry model={} attempt={} delayMs={} reason={}",
                        model,
                        attempt,
                        delayMs,
                        summarizeGeminiError(exception)
                );
                sleepQuietly(delayMs);
            }
        }

        throw new IllegalStateException("Gemini request failed.", lastException);
    }

    // -------------------------------------------------------------------------
    // Payload builders
    // -------------------------------------------------------------------------

    /**
     * Build a multi-turn payload that includes prior conversation history
     * so Gemini can respond in context. System instruction is injected
     * as a dedicated "system_instruction" node (supported by Gemini 2.x API).
     */
    private ObjectNode buildMultiTurnPayload(String userPrompt, String coinContextJson, List<ChatMessage> history) {
        ObjectNode payload = objectMapper.createObjectNode();

        // System instruction (Gemini 2.x supports this field)
        ObjectNode systemInstruction = payload.putObject("system_instruction");
        systemInstruction.putArray("parts").addObject().put("text", SYSTEM_INSTRUCTION);

        // Conversation history (trimmed to last MAX_HISTORY_TURNS messages)
        ArrayNode contents = payload.putArray("contents");

        List<ChatMessage> trimmedHistory = trimHistory(history);
        for (ChatMessage msg : trimmedHistory) {
            ObjectNode contentNode = contents.addObject();
            // Gemini expects "user" or "model" roles
            String geminiRole = "user".equalsIgnoreCase(msg.getRole()) ? "user" : "model";
            contentNode.put("role", geminiRole);
            contentNode.putArray("parts").addObject().put("text", msg.getContent());
        }

        // Current user turn
        ObjectNode currentTurn = contents.addObject();
        currentTurn.put("role", "user");
        String userText = StringUtils.hasText(coinContextJson)
                ? userPrompt + "\n\n[Live Coin Data JSON]: " + coinContextJson
                : userPrompt;
        currentTurn.putArray("parts").addObject().put("text", userText);

        // Generation config: keep responses focused
        ObjectNode generationConfig = payload.putObject("generationConfig");
        generationConfig.put("maxOutputTokens", 1024);
        generationConfig.put("temperature", 0.7);

        return payload;
    }

    private ObjectNode buildTextOnlyPayload(String prompt) {
        ObjectNode payload = objectMapper.createObjectNode();
        ArrayNode contents = payload.putArray("contents");
        ObjectNode content = contents.addObject();
        ArrayNode parts = content.putArray("parts");
        parts.addObject().put("text", prompt);
        return payload;
    }

    private List<ChatMessage> trimHistory(List<ChatMessage> history) {
        if (history == null || history.isEmpty()) {
            return Collections.emptyList();
        }
        int fromIndex = Math.max(0, history.size() - MAX_HISTORY_TURNS);
        return history.subList(fromIndex, history.size());
    }

    // -------------------------------------------------------------------------
    // Response extraction
    // -------------------------------------------------------------------------

    private String extractGeminiText(JsonNode responseBody) {
        JsonNode parts = responseBody.path("candidates").path(0).path("content").path("parts");
        if (parts.isArray()) {
            for (JsonNode part : parts) {
                if (part.has("text") && part.get("text").isTextual()) {
                    return part.get("text").asText();
                }
            }
        }
        return "I could not generate a response right now.";
    }

    // -------------------------------------------------------------------------
    // CoinGecko helpers
    // -------------------------------------------------------------------------

    @SuppressWarnings("rawtypes")
    private ResponseEntity<Map> callCoinGecko(String url) {
        HttpHeaders headers = new HttpHeaders();
        if (StringUtils.hasText(coinGeckoApiKey)) {
            headers.set("x-cg-demo-api-key", coinGeckoApiKey);
        }

        HttpEntity<Void> request = new HttpEntity<>(headers);
        return restTemplate.exchange(url, HttpMethod.GET, request, Map.class);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> mapOf(Object value) {
        if (value instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return Collections.emptyMap();
    }

    private double convertToDouble(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        if (value == null) {
            return 0.0D;
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException ignored) {
            return 0.0D;
        }
    }

    private Integer convertToInteger(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value == null) {
            return null;
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private String extractCoinHintFromPrompt(String prompt) {
        if (!StringUtils.hasText(prompt)) {
            return "";
        }

        try {
            String extractionPrompt = "Extract the main cryptocurrency name or symbol from this user request.\n"
                    + "Return only that coin name/symbol with no explanation.\n"
                    + "If no coin is mentioned, return UNKNOWN.\n\n"
                    + "User request: " + prompt;
            JsonNode responseBody = callGemini(buildTextOnlyPayload(extractionPrompt));
            String extracted = extractGeminiText(responseBody)
                    .replace("`", "")
                    .replace("\"", "")
                    .trim();
            if (!StringUtils.hasText(extracted)) {
                return prompt.trim();
            }
            String firstLine = extracted.split("\\R")[0].trim();
            if (!StringUtils.hasText(firstLine) || "UNKNOWN".equalsIgnoreCase(firstLine)) {
                return prompt.trim();
            }
            return firstLine;
        } catch (Exception exception) {
            LOGGER.warn("coin_hint_extraction_fallback reason={}", summarizeGeminiError(exception));
            return prompt.trim();
        }
    }

    @SuppressWarnings("unchecked")
    private String resolveCoinId(String coinHint) {
        if (!StringUtils.hasText(coinHint)) {
            return null;
        }

        String searchUrl = COINGECKO_BASE_URL + "/search?query="
                + UriUtils.encode(coinHint.trim(), StandardCharsets.UTF_8);

        try {
            ResponseEntity<Map> response = callCoinGecko(searchUrl);
            Map<String, Object> body = (Map<String, Object>) response.getBody();
            if (body != null) {
                Object coinsObj = body.get("coins");
                if (coinsObj instanceof List<?> coins && !coins.isEmpty() && coins.get(0) instanceof Map<?, ?> coin) {
                    Object id = ((Map<String, Object>) coin).get("id");
                    if (id instanceof String idValue && StringUtils.hasText(idValue)) {
                        return idValue;
                    }
                }
            }
        } catch (Exception ignored) {
            // Fallback below
        }

        String normalized = coinHint.trim().toLowerCase(Locale.ROOT);
        if (normalized.matches("^[a-z0-9-]{2,40}$")) {
            return normalized;
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private CoinDTO fetchCoinById(String coinId) {
        if (!StringUtils.hasText(coinId)) {
            return null;
        }

        String url = COINGECKO_BASE_URL + "/coins/" + coinId
                + "?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false";

        ResponseEntity<Map> responseEntity;
        try {
            responseEntity = callCoinGecko(url);
        } catch (HttpClientErrorException.NotFound notFoundException) {
            LOGGER.info("coingecko_coin_not_found coinId={}", coinId);
            return null;
        }

        Map<String, Object> responseBody = (Map<String, Object>) responseEntity.getBody();
        if (responseBody == null) {
            return null;
        }

        Map<String, Object> image = mapOf(responseBody.get("image"));
        Map<String, Object> marketData = mapOf(responseBody.get("market_data"));

        CoinDTO coinInfo = new CoinDTO();
        coinInfo.setId((String) responseBody.get("id"));
        coinInfo.setSymbol((String) responseBody.get("symbol"));
        coinInfo.setName((String) responseBody.get("name"));
        coinInfo.setImage((String) image.get("large"));

        coinInfo.setCurrentPrice(convertToDouble(mapOf(marketData.get("current_price")).get("usd")));
        coinInfo.setMarketCap(convertToDouble(mapOf(marketData.get("market_cap")).get("usd")));
        coinInfo.setMarketCapRank(convertToInteger(responseBody.get("market_cap_rank")) == null
                ? 0
                : convertToInteger(responseBody.get("market_cap_rank")));
        coinInfo.setTotalVolume(convertToDouble(mapOf(marketData.get("total_volume")).get("usd")));
        coinInfo.setHigh24h(convertToDouble(mapOf(marketData.get("high_24h")).get("usd")));
        coinInfo.setLow24h(convertToDouble(mapOf(marketData.get("low_24h")).get("usd")));
        coinInfo.setPriceChange24h(convertToDouble(marketData.get("price_change_24h")));
        coinInfo.setPriceChangePercentage24h(convertToDouble(marketData.get("price_change_percentage_24h")));
        coinInfo.setMarketCapChange24h(convertToDouble(marketData.get("market_cap_change_24h")));
        coinInfo.setMarketCapChangePercentage24h(convertToDouble(marketData.get("market_cap_change_percentage_24h")));
        coinInfo.setCirculatingSupply(convertToDouble(marketData.get("circulating_supply")));
        coinInfo.setTotalSupply(convertToDouble(marketData.get("total_supply")));

        return coinInfo;
    }

    // -------------------------------------------------------------------------
    // Retry / error helpers
    // -------------------------------------------------------------------------

    private boolean isRetryableGeminiException(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            if (current instanceof HttpStatusCodeException httpStatusCodeException) {
                int statusCode = httpStatusCodeException.getStatusCode().value();
                return statusCode == 429
                        || statusCode == 500
                        || statusCode == 502
                        || statusCode == 503
                        || statusCode == 504;
            }
            current = current.getCause();
        }
        return false;
    }

    private String summarizeGeminiError(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            if (current instanceof HttpStatusCodeException httpStatusCodeException) {
                return "status=" + httpStatusCodeException.getStatusCode().value();
            }
            current = current.getCause();
        }
        return throwable.getClass().getSimpleName();
    }

    private void sleepQuietly(long delayMs) {
        try {
            Thread.sleep(delayMs);
        } catch (InterruptedException interruptedException) {
            Thread.currentThread().interrupt();
        }
    }

    // -------------------------------------------------------------------------
    // Input validation
    // -------------------------------------------------------------------------

    private String validatePrompt(String prompt) {
        if (!StringUtils.hasText(prompt)) {
            return "Please enter a message.";
        }
        if (prompt.trim().length() > MAX_PROMPT_LENGTH) {
            return "Your message is too long. Please keep it under " + MAX_PROMPT_LENGTH + " characters.";
        }
        return null; // valid
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    @Override
    public ApiResponse getCoinDetails(String prompt, List<ChatMessage> history) {
        long startedAt = System.currentTimeMillis();
        ApiResponse result = new ApiResponse();

        try {
            String validationError = validatePrompt(prompt);
            if (validationError != null) {
                result.setStatus(false);
                result.setMessage(validationError);
                return result;
            }

            String trimmedPrompt = prompt.trim();
            String coinHint = extractCoinHintFromPrompt(trimmedPrompt);
            String coinId = resolveCoinId(coinHint);
            CoinDTO coin = fetchCoinById(coinId);

            if (coin == null && !coinHint.equalsIgnoreCase(trimmedPrompt)) {
                String fallbackCoinId = resolveCoinId(trimmedPrompt);
                coin = fetchCoinById(fallbackCoinId);
                if (coin != null) {
                    coinId = fallbackCoinId;
                }
            }

            // Build the Gemini multi-turn payload with or without coin data
            String coinJson = coin != null ? objectMapper.writeValueAsString(coin) : null;
            ObjectNode payload = buildMultiTurnPayload(trimmedPrompt, coinJson, history);
            JsonNode responseBody = callGemini(payload);

            result.setMessage(extractGeminiText(responseBody));
            result.setStatus(true);
            LOGGER.info("chatbot_response_success totalMs={} coinId={} historySize={}",
                    System.currentTimeMillis() - startedAt, coinId, history.size());
            return result;

        } catch (Exception exception) {
            result.setStatus(false);
            result.setMessage("Chatbot is unavailable right now. Please try again in a moment.");
            if (isRetryableGeminiException(exception)) {
                LOGGER.warn(
                        "chatbot_response_failed totalMs={} reason={}",
                        System.currentTimeMillis() - startedAt,
                        summarizeGeminiError(exception)
                );
            } else {
                LOGGER.warn("chatbot_response_failed totalMs={}", System.currentTimeMillis() - startedAt, exception);
            }
            return result;
        }
    }

    @Override
    public CoinDTO getCoinByName(String coinName) {
        String coinId = resolveCoinId(coinName);
        return fetchCoinById(coinId);
    }

    @Override
    public String simpleChat(String prompt) {
        String validationError = validatePrompt(prompt);
        if (validationError != null) {
            return validationError;
        }
        try {
            // Use system instruction even for simple chat
            ObjectNode payload = buildMultiTurnPayload(prompt.trim(), null, Collections.emptyList());
            JsonNode responseBody = callGemini(payload);
            return extractGeminiText(responseBody);
        } catch (Exception exception) {
            return "Chatbot is unavailable right now. Please try again in a moment.";
        }
    }
}
