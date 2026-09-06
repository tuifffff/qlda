package com.sellingphone.repository;

import com.sellingphone.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Integer> {

    /**
     * Lấy tất cả banner đang active, sắp xếp mới nhất lên trước.
     */
    List<Banner> findByIsActiveTrueOrderByCreatedAtDesc();
}
