package com.sellingphone.dto.request;

import lombok.Data;

@Data
public class RegisterVerifyRequest {
    private String email;
    private String otp;
}
