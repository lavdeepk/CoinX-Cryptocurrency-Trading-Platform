package com.himanshu.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
/**
 * DTO returned to frontend for persisted chat messages.
 */
public class ChatMessageResponse {
    private Long id;
    private String role;
    private String text;
    private LocalDateTime createdAt;
}
