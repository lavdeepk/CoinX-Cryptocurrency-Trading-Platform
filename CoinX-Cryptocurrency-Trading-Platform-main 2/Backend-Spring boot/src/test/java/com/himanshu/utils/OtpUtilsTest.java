package com.himanshu.utils;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Utility helper for OtpUtilsTest.
 */
class OtpUtilsTest {

    @Test
    void generateOTP_shouldReturnSixDigitNumericValue() {
        String otp = OtpUtils.generateOTP();

        assertTrue(otp.matches("\\d{6}"));
    }

    @Test
    void generateOTP_shouldAlwaysMatchExpectedFormat() {
        for (int i = 0; i < 100; i++) {
            String otp = OtpUtils.generateOTP();
            assertTrue(otp.matches("\\d{6}"));
        }
    }
}
