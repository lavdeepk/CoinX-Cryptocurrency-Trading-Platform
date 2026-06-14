package com.himanshu.response;

import lombok.Data;

@Data
/**
 * Response DTO returned by FunctionResponse APIs.
 */
public class FunctionResponse {
    private String functionName;
    private String currencyName;
    private String currencyData;
}
