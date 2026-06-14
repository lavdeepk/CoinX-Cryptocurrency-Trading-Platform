package com.himanshu.request;

import com.himanshu.model.enums.VerificationType;
import lombok.Data;

@Data
/**
 * Request DTO used by UpdatePasswordRequest APIs.
 */
public class UpdatePasswordRequest {
    private String sendTo;
    private VerificationType verificationType;
}
