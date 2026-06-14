package com.himanshu.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
/**
 * Response DTO returned by ApiResponse APIs.
 */
public class ApiResponse {
	
	private String message;
	private boolean status;

}
