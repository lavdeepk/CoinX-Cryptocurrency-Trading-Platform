package com.himanshu.service;

import com.himanshu.model.ChatMessage;
import com.himanshu.model.User;

import java.util.List;

/**
 * Service contract for chat persistence and retrieval.
 */
public interface ChatMessageService {
    ChatMessage saveMessage(User user, String role, String content);

    void saveConversation(User user, String userPrompt, String modelResponse);

    List<ChatMessage> getRecentMessages(User user, int limit);

    void clearUserHistory(User user);
}
