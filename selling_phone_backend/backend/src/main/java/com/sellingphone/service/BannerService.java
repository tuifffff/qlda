package com.sellingphone.service;

import com.sellingphone.dto.response.BannerResponse;
import com.sellingphone.mapper.BannerMapper;
import com.sellingphone.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;
    private final BannerMapper     bannerMapper;

    /**
     * Lấy danh sách banner đang active, sắp xếp theo createdAt giảm dần.
     */
    public List<BannerResponse> getActiveBanners() {
        List<BannerResponse> banners = bannerRepository.findByIsActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(bannerMapper::toBannerResponse)
                .collect(Collectors.toList());

        log.info("[BannerService] Lấy {} banner đang active", banners.size());
        return banners;
    }
}
