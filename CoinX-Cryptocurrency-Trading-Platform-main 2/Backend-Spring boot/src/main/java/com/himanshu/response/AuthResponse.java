package com.himanshu.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
/**
 * Response DTO returned by AuthResponse APIs.
 */
public class AuthResponse {
	
	private String jwt;
	private boolean status;
	private String message;
	private boolean isTwoFactorAuthEnabled=false;
	private String session;

}
