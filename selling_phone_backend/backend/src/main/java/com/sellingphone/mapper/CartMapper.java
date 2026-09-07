package com.sellingphone.mapper;

import com.sellingphone.dto.response.CartResponse;
import com.sellingphone.entity.Cart;
import com.sellingphone.entity.CartDetail;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

/**
 * CartMapper: chuyển đổi Cart entity → CartResponse DTO.
 */
@Component
public class CartMapper {

    public CartResponse toCartResponse(Cart cart) {
        CartResponse response = new CartResponse();
        response.setCartId(cart.getCartId());

        List<CartDetail> details = cart.getCartDetails() != null
                ? cart.getCartDetails()
                : Collections.emptyList();

        List<CartResponse.CartItemResponse> items = details.stream()
                .map(this::toCartItemResponse)
                .toList();

        response.setItems(items);

        BigDecimal total = items.stream()
                .map(CartResponse.CartItemResponse::getSubTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        response.setTotalPrice(total);
        return response;
    }

    private CartResponse.CartItemResponse toCartItemResponse(CartDetail detail) {
        CartResponse.CartItemResponse item = new CartResponse.CartItemResponse();
        item.setVersionId(detail.getVersion().getVersionId());
        item.setProductName(detail.getVersion().getProduct().getProductName());
        item.setColour(detail.getVersion().getColour());
        item.setStorage(detail.getVersion().getStorage());
        item.setImageUrl(detail.getVersion().getImageUrl());
        item.setPrice(detail.getVersion().getPrice());
        item.setQuantity(detail.getQuantity());
        item.setSubTotal(detail.getVersion().getPrice()
                .multiply(BigDecimal.valueOf(detail.getQuantity())));
        return item;
    }
}
