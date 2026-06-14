package com.himanshu.controller;

import com.himanshu.exception.UserException;
import com.himanshu.model.ChatMessage;
import com.himanshu.model.User;
import com.himanshu.dto.CoinDTO;
import com.himanshu.request.PromptBody;
import com.himanshu.response.ApiResponse;
import com.himanshu.response.ChatMessageResponse;
import com.himanshu.service.ChatMessageService;
import com.himanshu.service.ChatBotService;
import com.himanshu.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@RestController()
@RequestMapping("/api/chat")
/**
 * REST controller responsible for ChatBotController endpoints.
 */
public class ChatBotController {

    private static final int STREAM_CHUNK_SIZE = 22;
    private static final int DEFAULT_HISTORY_LIMIT = 80;
    /** Number of recent messages passed to Gemini as conversation context. */
    private static final int CONTEXT_WINDOW_SIZE = 10;

    private final ChatBotService chatBotService;
    private final ChatMessageService chatMessageService;
    private final UserService userService;

    public ChatBotController(
            ChatBotService chatBotService,
            ChatMessageService chatMessageService,
            UserService userService
    ) {
        this.chatBotService = chatBotService;
        this.chatMessageService = chatMessageService;
        this.userService = userService;
    }

    @GetMapping("/coin/{coinName}")
    public ResponseEntity<CoinDTO> getCoinDetails(@PathVariable String coinName) {

        CoinDTO coinDTO = chatBotService.getCoinByName(coinName);
        return new ResponseEntity<>(coinDTO, HttpStatus.OK);
    }

    @PostMapping("/bot")
    public ResponseEntity<String> simpleChat(@RequestBody PromptBody promptBody) {

        String res = chatBotService.simpleChat(promptBody.getPrompt());
        return new ResponseEntity<>(res, HttpStatus.OK);
    }


    @PostMapping("/bot/coin")
    public ResponseEntity<ApiResponse> getCoinRealtimeTime(
            @RequestBody PromptBody promptBody,
            @RequestHeader("Authorization") String jwt
    ) throws UserException {

        User user = userService.findUserProfileByJwt(jwt);
        List<ChatMessage> history = chatMessageService.getRecentMessages(user, CONTEXT_WINDOW_SIZE);

        ApiResponse res = chatBotService.getCoinDetails(promptBody.getPrompt(), history);
        chatMessageService.saveConversation(user, promptBody.getPrompt(), res.getMessage());
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @PostMapping(value = "/bot/coin/stream", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<StreamingResponseBody> getCoinRealtimeTimeStream(
            @RequestBody PromptBody promptBody,
            @RequestHeader("Authorization") String jwt
    ) throws UserException {
        User user = userService.findUserProfileByJwt(jwt);
        String prompt = promptBody.getPrompt();

        // Load recent conversation history to give Gemini context
        List<ChatMessage> history = chatMessageService.getRecentMessages(user, CONTEXT_WINDOW_SIZE);

        ApiResponse response = chatBotService.getCoinDetails(prompt, history);
        String finalMessage = StringUtils.hasText(response.getMessage())
                ? response.getMessage()
                : "No response received.";

        chatMessageService.saveConversation(user, prompt, finalMessage);

        StreamingResponseBody stream = outputStream -> {
            try {
                for (String chunk : splitMessageForStream(finalMessage, STREAM_CHUNK_SIZE)) {
                    outputStream.write(chunk.getBytes(StandardCharsets.UTF_8));
                    outputStream.flush();
                }
            } catch (IOException ioException) {
                if (!isClientDisconnect(ioException)) {
                    throw ioException;
                }
            }
        };

        return ResponseEntity
                .ok()
                .contentType(MediaType.TEXT_PLAIN)
                .body(stream);
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessageResponse>> getChatHistory(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "limit", defaultValue = "80") int limit
    ) throws UserException {
        User user = userService.findUserProfileByJwt(jwt);
        int normalizedLimit = limit <= 0 ? DEFAULT_HISTORY_LIMIT : limit;

        List<ChatMessageResponse> history = chatMessageService.getRecentMessages(user, normalizedLimit)
                .stream()
                .map(this::toChatMessageResponse)
                .toList();

        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/history")
    public ResponseEntity<ApiResponse> clearChatHistory(
            @RequestHeader("Authorization") String jwt
    ) throws UserException {
        User user = userService.findUserProfileByJwt(jwt);
        chatMessageService.clearUserHistory(user);
        return ResponseEntity.ok(new ApiResponse("Chat history cleared.", true));
    }

    private ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage) {
        return new ChatMessageResponse(
                chatMessage.getId(),
                chatMessage.getRole(),
                chatMessage.getContent(),  // maps entity `content` → DTO `text`
                chatMessage.getCreatedAt()
        );
    }

    private List<String> splitMessageForStream(String message, int chunkSize) {
        if (!StringUtils.hasText(message)) {
            return List.of("");
        }
        if (chunkSize <= 0 || message.length() <= chunkSize) {
            return List.of(message);
        }

        List<String> chunks = new ArrayList<>();
        for (int index = 0; index < message.length(); index += chunkSize) {
            chunks.add(message.substring(index, Math.min(index + chunkSize, message.length())));
        }
        return chunks;
    }

    private boolean isClientDisconnect(IOException ioException) {
        String message = ioException.getMessage();
        if (!StringUtils.hasText(message)) {
            return false;
        }
        String normalized = message.toLowerCase(Locale.ROOT);
        return normalized.contains("broken pipe")
                || normalized.contains("connection reset by peer");
    }
}
