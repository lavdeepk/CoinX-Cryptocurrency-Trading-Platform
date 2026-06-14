package com.himanshu.request;

import lombok.Data;

@Data
/**
 * Request DTO used by ResetPasswordRequest APIs.
 */
public class ResetPasswordRequest {

    private String password;
    private String otp;
}
