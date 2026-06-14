package com.himanshu.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
/**
 * Request DTO used by LoginRequest APIs.
 */
public class LoginRequest {
	
	private String email;
	private String password;

}
