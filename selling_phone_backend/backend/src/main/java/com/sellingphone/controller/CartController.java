package com.sellingphone.controller;

import com.sellingphone.dto.request.CartItemRequest;
import com.sellingphone.dto.response.ApiResponse;
import com.sellingphone.dto.response.CartResponse;
import com.sellingphone.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // GET /api/cart/my-cart — Lấy giỏ hàng của chính tôi
    @GetMapping("/my-cart")
    public ResponseEntity<ApiResponse<CartResponse>> getMyCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(ApiResponse.fail("Bạn cần đăng nhập"));
        }
        CartResponse cart = cartService.getMyCart(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Lấy giỏ hàng thành công", cart));
    }

    // POST /api/cart/add — Thêm sản phẩm vào giỏ
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CartItemRequest request) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(ApiResponse.fail("Bạn cần đăng nhập"));
        }
        CartResponse cart = cartService.addToCart(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.ok("Thêm vào giỏ hàng thành công", cart));
    }

    // PUT /api/cart/update — Cập nhật số lượng (Nút + -)
    @PutMapping("/update")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CartItemRequest request) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(ApiResponse.fail("Bạn cần đăng nhập"));
        }
        CartResponse cart = cartService.updateCartItem(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật giỏ hàng thành công", cart));
    }

    // DELETE /api/cart/remove/{versionId} — Xóa sản phẩm khỏi giỏ
    @DeleteMapping("/remove/{versionId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer versionId) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(ApiResponse.fail("Bạn cần đăng nhập"));
        }
        CartResponse cart = cartService.removeFromCart(userDetails.getUsername(), versionId);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa sản phẩm khỏi giỏ hàng", cart));
    }
}
