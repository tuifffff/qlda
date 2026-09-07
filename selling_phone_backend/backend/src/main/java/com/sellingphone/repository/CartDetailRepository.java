package com.sellingphone.repository;

import com.sellingphone.entity.CartDetail;
import com.sellingphone.entity.CartDetailId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartDetailRepository extends JpaRepository<CartDetail, CartDetailId> {
}
