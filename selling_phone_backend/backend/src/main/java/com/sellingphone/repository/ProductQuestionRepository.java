package com.sellingphone.repository;

import com.sellingphone.entity.ProductQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductQuestionRepository extends JpaRepository<ProductQuestion, Integer> {

    // Lấy tất cả câu hỏi của 1 sản phẩm kèm thông tin user (tránh N+1)
    @Query("SELECT q FROM ProductQuestion q " +
           "JOIN FETCH q.user " +
           "WHERE q.product.productId = :productId " +
           "ORDER BY q.createdAt DESC")
    List<ProductQuestion> findByProductId(@Param("productId") Integer productId);
}
