package com.himanshu.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
/**
 * Custom exception type used by ErrorDetails.
 */
public class ErrorDetails {
	
	private String error;
	private String message;
	private LocalDateTime timestamp;

}
