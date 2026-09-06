package com.sellingphone.controller;

import com.sellingphone.dto.response.ApiResponse;
import com.sellingphone.dto.response.BannerResponse;
import com.sellingphone.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/banner")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    // GET /api/banner/active — Lấy danh sách banner đang hiển thị
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<BannerResponse>>> getActiveBanners() {
        List<BannerResponse> banners = bannerService.getActiveBanners();
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách banner thành công", banners));
    }
}
