package com.himanshu.model;

import com.himanshu.model.enums.VerificationType;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
/**
 * Domain model representing VerificationCode.
 */
public class VerificationCode {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String otp;

    @OneToOne
    private User user;

    private String email;

    private String mobile;

    private VerificationType verificationType;

}
