package com.sellingphone.controller;

import com.sellingphone.dto.request.ChangePasswordRequest;
import com.sellingphone.dto.request.ForgotPasswordRequest;
import com.sellingphone.dto.request.LoginRequest;
import com.sellingphone.dto.request.OtpVerifyRequest;
import com.sellingphone.dto.request.RefreshTokenRequest;
import com.sellingphone.dto.request.RegisterRequest;
import com.sellingphone.dto.request.RegisterVerifyRequest;
import com.sellingphone.dto.request.ResetPasswordRequest;
import com.sellingphone.dto.request.UpdateProfileRequest;
import com.sellingphone.dto.response.ApiResponse;
import com.sellingphone.dto.response.AuthResponse;
import com.sellingphone.dto.response.UserResponse;
import com.sellingphone.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // POST /api/user/register — Bước 1: kiểm tra & gửi OTP
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@RequestBody RegisterRequest request) {
        userService.register(request);
        return ResponseEntity.ok(
                ApiResponse.ok("Mã OTP đã được gửi đến email. Vui lòng xác thực để hoàn tất đăng ký."));
    }

    // POST /api/user/register/verify-otp — Bước 2: xác thực OTP & tạo tài khoản
    @PostMapping("/register/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyRegister(@RequestBody RegisterVerifyRequest request) {
        userService.verifyRegister(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đăng ký thành công! Vui lòng đăng nhập."));
    }

    // POST /api/user/login — Đăng nhập
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        AuthResponse authResponse = userService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công", authResponse));
    }

    // POST /api/user/forgot-password — Gửi OTP quên mật khẩu
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request);
        return ResponseEntity.ok(
                ApiResponse.ok("Mã OTP đã được gửi đến email. Mã có hiệu lực trong 5 phút.")
        );
    }

    // POST /api/user/verify-otp — Xác thực OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<String>> verifyOtp(@RequestBody OtpVerifyRequest request) {
        String resetToken = userService.verifyOtp(request);
        return ResponseEntity.ok(
                ApiResponse.ok("OTP hợp lệ. Vui lòng đặt lại mật khẩu.", resetToken)
        );
    }

    // POST /api/user/reset-password — Đặt lại mật khẩu
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request);
        return ResponseEntity.ok(
                ApiResponse.ok("Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại.")
        );
    }

    // POST /api/user/refresh — Làm mới access token
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@RequestBody RefreshTokenRequest request) {
        AuthResponse authResponse = userService.refresh(request);
        return ResponseEntity.ok(ApiResponse.ok("Token đã được làm mới", authResponse));
    }

    // POST /api/user/logout — Đăng xuất
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody RefreshTokenRequest request) {
        userService.logout(request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng xuất thành công"));
    }

    // GET /api/user/profile — Lấy thông tin cá nhân (cần JWT)
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        UserResponse userResponse = userService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Lấy thông tin thành công", userResponse));
    }

    // PUT /api/user/profile — Cập nhật thông tin cá nhân
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserResponse updated = userService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thông tin thành công", updated));
    }

    // PATCH /api/user/change-password — Đổi mật khẩu (cần mật khẩu cũ)
    @PatchMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        userService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.ok("Đổi mật khẩu thành công"));
    }

    // PATCH /api/user/avatar — Upload avatar lên Cloudinary
    @PatchMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserResponse>> uploadAvatar(
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserResponse updated = userService.uploadAvatar(userDetails.getUsername(), file);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật ảnh đại diện thành công", updated));
    }
}
