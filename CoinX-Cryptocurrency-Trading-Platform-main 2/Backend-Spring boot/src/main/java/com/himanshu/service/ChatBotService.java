package com.himanshu.service;

import com.himanshu.dto.CoinDTO;
import com.himanshu.model.ChatMessage;
import com.himanshu.response.ApiResponse;

import java.util.List;

/**
 * Service contract for ChatBotService operations.
 */
public interface ChatBotService {

    /**
     * Answer a coin-related prompt using live CoinGecko data + Gemini AI.
     * Optionally accepts conversation history for multi-turn context.
     */
    ApiResponse getCoinDetails(String prompt, List<ChatMessage> history);

    /**
     * Convenience overload without history (stateless / backward-compat).
     */
    default ApiResponse getCoinDetails(String prompt) {
        return getCoinDetails(prompt, List.of());
    }

    CoinDTO getCoinByName(String coinName);

    String simpleChat(String prompt);
}
