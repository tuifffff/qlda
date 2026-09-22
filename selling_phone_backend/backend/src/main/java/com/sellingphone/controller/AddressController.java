package com.sellingphone.controller;

import com.sellingphone.dto.request.AddressRequest;
import com.sellingphone.dto.response.AddressResponse;
import com.sellingphone.dto.response.ApiResponse;
import com.sellingphone.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    // GET /api/user/addresses/my — Lấy danh sách địa chỉ của tôi
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getMyAddresses(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<AddressResponse> addresses = addressService.getMyAddresses(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách địa chỉ thành công", addresses));
    }

    // POST /api/user/addresses/add — Thêm địa chỉ mới
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<AddressResponse>> addAddress(
            @Valid @RequestBody AddressRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        AddressResponse response = addressService.addAddress(userDetails.getUsername(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thêm địa chỉ thành công", response));
    }

    // PUT /api/user/addresses/update/{id} — Cập nhật địa chỉ
    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @PathVariable Integer id,
            @Valid @RequestBody AddressRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        AddressResponse response = addressService.updateAddress(userDetails.getUsername(), id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật địa chỉ thành công", response));
    }

    // PATCH /api/user/addresses/set-default/{id} — Đặt làm địa chỉ mặc định
    @PatchMapping("/set-default/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> setDefault(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        AddressResponse response = addressService.setDefault(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok("Đặt địa chỉ mặc định thành công", response));
    }

    // DELETE /api/user/addresses/delete/{id} — Xóa địa chỉ
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        addressService.deleteAddress(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa địa chỉ thành công"));
    }
}
