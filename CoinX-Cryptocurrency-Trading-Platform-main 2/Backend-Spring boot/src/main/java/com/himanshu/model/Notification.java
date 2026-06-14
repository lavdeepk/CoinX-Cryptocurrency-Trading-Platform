package com.himanshu.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
/**
 * Domain model representing Notification.
 */
public class Notification {
    private Long fromUserId;
    private Long toUserid;
    private Long amount;
    private String message;
}
