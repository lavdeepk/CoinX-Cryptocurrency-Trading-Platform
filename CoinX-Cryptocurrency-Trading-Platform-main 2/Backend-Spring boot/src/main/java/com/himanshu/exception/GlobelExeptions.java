package com.himanshu.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;

import java.io.EOFException;
import java.net.SocketException;
import java.time.LocalDateTime;

@ControllerAdvice
/**
 * Custom exception type used by GlobelExeptions.
 */
public class GlobelExeptions {
	private static final Logger LOGGER = LoggerFactory.getLogger(GlobelExeptions.class);
	
	
	@ExceptionHandler(UserException.class)
	public ResponseEntity<ErrorDetails> userExceptionHandler(UserException ue,
			WebRequest req){
		ErrorDetails error=new ErrorDetails(ue.getMessage(),
				req.getDescription(false),
				LocalDateTime.now());
		return new ResponseEntity<ErrorDetails>(error,HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(RuntimeException.class)
	public ResponseEntity<ErrorDetails> handleRuntimeException(RuntimeException ex, WebRequest request) {
		if (isClientDisconnected(ex)) {
			LOGGER.debug("Client disconnected before response was flushed: {}", ex.getMessage());
			return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
		}

		ErrorDetails error = new ErrorDetails(ex.getMessage(),
				request.getDescription(false),
				LocalDateTime.now());
		return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(AsyncRequestNotUsableException.class)
	public ResponseEntity<Void> handleAsyncRequestNotUsable(AsyncRequestNotUsableException ex) {
		LOGGER.debug("Ignoring async request not usable after client disconnect: {}", ex.getMessage());
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorDetails> handleOtherExceptions(Exception ex, WebRequest request) {
		if (isClientDisconnected(ex)) {
			LOGGER.debug("Ignoring disconnected client exception: {}", ex.getMessage());
			return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
		}

		ErrorDetails error = new ErrorDetails(ex.getMessage(),
				request.getDescription(false),
				LocalDateTime.now());
		return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	private boolean isClientDisconnected(Throwable throwable) {
		Throwable current = throwable;
		while (current != null) {
			if (current instanceof AsyncRequestNotUsableException
					|| current instanceof EOFException
					|| current instanceof SocketException) {
				return true;
			}

			String message = current.getMessage();
			if (message != null) {
				String normalized = message.toLowerCase();
				if (normalized.contains("broken pipe")
						|| normalized.contains("connection reset by peer")
						|| normalized.contains("connection reset")) {
					return true;
				}
			}
			current = current.getCause();
		}
		return false;
	}
}
