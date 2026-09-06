package com.sellingphone.mapper;

import com.sellingphone.dto.response.BannerResponse;
import com.sellingphone.entity.Banner;
import org.springframework.stereotype.Component;

/**
 * BannerMapper: chuyển đổi Banner entity → BannerResponse DTO.
 */
@Component
public class BannerMapper {

    public BannerResponse toBannerResponse(Banner banner) {
        BannerResponse response = new BannerResponse();
        response.setId(banner.getId());
        response.setImageUrl(banner.getImageUrl());
        response.setLinkUrl(banner.getLinkUrl());
        response.setIsActive(banner.getIsActive());
        response.setCreatedAt(banner.getCreatedAt());
        return response;
    }
}
