package com.himanshu.service.impl;

import com.himanshu.model.ChatMessage;
import com.himanshu.model.User;
import com.himanshu.repository.ChatMessageRepository;
import com.himanshu.service.ChatMessageService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
/**
 * Service implementation that contains business logic for ChatMessageServiceImpl.
 */
public class ChatMessageServiceImpl implements ChatMessageService {

    private static final int DEFAULT_HISTORY_LIMIT = 80;
    private static final int MAX_HISTORY_LIMIT = 200;

    private final ChatMessageRepository chatMessageRepository;

    public ChatMessageServiceImpl(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    @Override
    @Transactional
    public ChatMessage saveMessage(User user, String role, String content) {
        if (user == null || !StringUtils.hasText(role) || !StringUtils.hasText(content)) {
            return null;
        }

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setUser(user);
        chatMessage.setRole(role.toLowerCase());
        chatMessage.setContent(content);
        return chatMessageRepository.save(chatMessage);
    }

    @Override
    @Transactional
    public void saveConversation(User user, String userPrompt, String modelResponse) {
        saveMessage(user, "user", userPrompt);
        saveMessage(user, "model", modelResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessage> getRecentMessages(User user, int limit) {
        if (user == null) {
            return Collections.emptyList();
        }

        int normalizedLimit = limit <= 0 ? DEFAULT_HISTORY_LIMIT : Math.min(limit, MAX_HISTORY_LIMIT);

        List<ChatMessage> newestFirst = chatMessageRepository.findByUser(
                user,
                PageRequest.of(0, normalizedLimit, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();

        List<ChatMessage> oldestFirst = new ArrayList<>(newestFirst);
        Collections.reverse(oldestFirst);
        return oldestFirst;
    }

    @Override
    @Transactional
    public void clearUserHistory(User user) {
        if (user != null) {
            chatMessageRepository.deleteByUser(user);
        }
    }
}
