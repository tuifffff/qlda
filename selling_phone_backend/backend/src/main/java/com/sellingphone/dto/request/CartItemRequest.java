package com.sellingphone.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CartItemRequest {

    @NotNull(message = "versionId không được để trống")
    private Integer versionId;

    @NotNull(message = "quantity không được để trống")
    @Min(value = 1, message = "quantity phải >= 1")
    private Integer quantity;
}
