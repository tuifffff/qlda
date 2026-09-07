package com.sellingphone.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CartResponse {

    private Integer            cartId;
    private List<CartItemResponse> items;
    private BigDecimal         totalPrice;

    @Data
    public static class CartItemResponse {
        private Integer    versionId;
        private String     productName;
        private String     colour;
        private String     storage;
        private String     imageUrl;
        private BigDecimal price;
        private Integer    quantity;
        private BigDecimal subTotal;   // price * quantity
    }
}
