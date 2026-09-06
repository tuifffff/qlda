package com.sellingphone.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BannerResponse {

    private Integer       id;
    private String        imageUrl;
    private String        linkUrl;
    private Boolean       isActive;
    private LocalDateTime createdAt;
}
