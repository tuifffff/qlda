package com.sellingphone.repository;

import com.sellingphone.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Integer> {

    /**
     * Tìm cart và JOIN FETCH toàn bộ cartDetails + version + product
     * trong một câu query duy nhất → tránh LazyInitializationException.
     */
    @Query("""
            SELECT c FROM Cart c
            LEFT JOIN FETCH c.cartDetails cd
            LEFT JOIN FETCH cd.version v
            LEFT JOIN FETCH v.product
            WHERE c.user.username = :username
            """)
    Optional<Cart> findWithItemsByUsername(@Param("username") String username);

    Optional<Cart> findByUser_Username(String username);
}
