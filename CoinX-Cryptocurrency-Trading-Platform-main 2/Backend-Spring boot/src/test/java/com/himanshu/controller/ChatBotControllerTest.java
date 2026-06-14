package com.himanshu.controller;

import com.himanshu.dto.CoinDTO;
import com.himanshu.model.User;
import com.himanshu.request.PromptBody;
import com.himanshu.response.ApiResponse;
import com.himanshu.service.ChatMessageService;
import com.himanshu.service.ChatBotService;
import com.himanshu.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
/**
 * REST controller responsible for ChatBotControllerTest endpoints.
 */
class ChatBotControllerTest {

    @Mock
    private ChatBotService chatBotService;
    @Mock
    private ChatMessageService chatMessageService;
    @Mock
    private UserService userService;
    @InjectMocks
    private ChatBotController chatBotController;

    private static final String JWT = "Bearer token";

    @Test
    void getCoinDetails_shouldReturnCoinDto() {
        CoinDTO coinDTO = new CoinDTO();
        coinDTO.setId("bitcoin");
        when(chatBotService.getCoinByName("bitcoin")).thenReturn(coinDTO);

        ResponseEntity<CoinDTO> response = chatBotController.getCoinDetails("bitcoin");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("bitcoin", response.getBody().getId());
    }

    @Test
    void simpleChat_shouldReturnResponse() {
        PromptBody body = new PromptBody();
        body.setPrompt("hello");
        when(chatBotService.simpleChat("hello")).thenReturn("hi");

        ResponseEntity<String> response = chatBotController.simpleChat(body);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("hi", response.getBody());
    }

    @Test
    void getCoinRealtimeTime_shouldReturnApiResponse() throws Exception {
        PromptBody body = new PromptBody();
        body.setPrompt("btc");
        ApiResponse apiResponse = new ApiResponse("ok", true);
        User user = new User();
        user.setId(1L);
        when(chatBotService.getCoinDetails(eq("btc"), anyList())).thenReturn(apiResponse);
        when(userService.findUserProfileByJwt(JWT)).thenReturn(user);
        doNothing().when(chatMessageService).saveConversation(any(User.class), anyString(), anyString());

        ResponseEntity<ApiResponse> response = chatBotController.getCoinRealtimeTime(body, JWT);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("ok", response.getBody().getMessage());
        assertEquals(true, response.getBody().isStatus());
    }
}
