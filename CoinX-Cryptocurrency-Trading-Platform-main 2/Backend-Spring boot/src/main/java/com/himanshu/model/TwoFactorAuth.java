package com.himanshu.model;

import com.himanshu.model.enums.VerificationType;
import lombok.Data;

@Data
/**
 * Domain model representing TwoFactorAuth.
 */
public class TwoFactorAuth {

    private boolean isEnabled = false;
    private VerificationType sendTo;
}
