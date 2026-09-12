package com.sellingphone.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sellingphone.config.JwtService;
import com.sellingphone.dto.request.ForgotPasswordRequest;
import com.sellingphone.dto.request.LoginRequest;
import com.sellingphone.dto.request.OtpVerifyRequest;
import com.sellingphone.dto.request.RefreshTokenRequest;
import com.sellingphone.dto.request.RegisterRequest;
import com.sellingphone.dto.request.RegisterVerifyRequest;
import com.sellingphone.dto.request.ResetPasswordRequest;
import com.sellingphone.dto.response.AuthResponse;
import com.sellingphone.dto.response.UserResponse;
import com.sellingphone.entity.Role;
import com.sellingphone.entity.User;
import com.sellingphone.exception.AppException;
import com.sellingphone.exception.ErrorCode;
import com.sellingphone.mapper.UserMapper;
import com.sellingphone.repository.RoleRepository;
import com.sellingphone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository        userRepository;
    private final RoleRepository        roleRepository;
    private final PasswordEncoder       passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService            jwtService;
    private final UserDetailsService    userDetailsService;
    private final EmailService          emailService;
    private final UserMapper            userMapper;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper                  objectMapper;

    @Value("${jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    private static final String REFRESH_PREFIX         = "refresh:";
    private static final String RESET_PREFIX           = "reset:";
    private static final String REGISTER_PREFIX        = "register:";
    private static final long   RESET_TTL_MINUTES      = 10;
    private static final long   REGISTER_TTL_MINUTES   = 10;
    private static final String DEFAULT_ROLE           = "USER";

    // -----------------------------------------------
    // 1. Đăng ký — Bước 1: kiểm tra & gửi OTP
    // -----------------------------------------------
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // Lưu thông tin đăng ký tạm thời vào Redis (TTL = 10 phút)
        try {
            String pendingData = objectMapper.writeValueAsString(Map.of(
                    "username", request.getUsername(),
                    "password", passwordEncoder.encode(request.getPassword())
            ));
            redisTemplate.opsForValue().set(
                    REGISTER_PREFIX + request.getEmail(),
                    pendingData,
                    Duration.ofMinutes(REGISTER_TTL_MINUTES)
            );
        } catch (JsonProcessingException e) {
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }

        // Gửi OTP xác thực về email
        emailService.sendOtpEmail(request.getEmail());
        log.info("[UserService] Gửi OTP đăng ký đến: {}", request.getEmail());
    }

    // -----------------------------------------------
    // 1b. Đăng ký — Bước 2: xác thực OTP & tạo user
    // -----------------------------------------------
    @Transactional
    public void verifyRegister(RegisterVerifyRequest request) {
        // Xác thực OTP
        if (!emailService.validateOtp(request.getEmail(), request.getOtp())) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        // Lấy thông tin đăng ký tạm từ Redis
        String pendingData = redisTemplate.opsForValue().get(REGISTER_PREFIX + request.getEmail());
        if (pendingData == null) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, String> data = objectMapper.readValue(pendingData, Map.class);
            String username        = data.get("username");
            String encodedPassword = data.get("password");

            Role userRole = roleRepository.findByName(DEFAULT_ROLE)
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

            Timestamp now = Timestamp.from(Instant.now());

            User newUser = User.builder()
                    .username(username)
                    .email(request.getEmail())
                    .password(encodedPassword)
                    .role(userRole)
                    .status((byte) 1)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();

            userRepository.save(newUser);

            // Xóa dữ liệu tạm khỏi Redis
            redisTemplate.delete(REGISTER_PREFIX + request.getEmail());
            log.info("[UserService] Tài khoản mới đã được xác thực và tạo: {}", username);

        } catch (JsonProcessingException e) {
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
    }

    // -----------------------------------------------
    // 2. Đăng nhập → trả về JWT
    // -----------------------------------------------
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (BadCredentialsException |
                 org.springframework.security.core.userdetails.UsernameNotFoundException e) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String accessToken  = jwtService.generateAccessToken(userDetails);
        String refreshToken = generateAndSaveRefreshToken(request.getUsername());

        log.info("[UserService] Đăng nhập: {}", request.getUsername());

        return AuthResponse.builder()
                .tokenType("Bearer")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtService.getExpirationMs())
                .build();
    }

    // -----------------------------------------------
    // 3. Quên mật khẩu — gửi OTP qua Gmail
    // -----------------------------------------------
    public void forgotPassword(ForgotPasswordRequest request) {
        if (!userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_NOT_FOUND);
        }
        emailService.sendOtpEmail(request.getEmail());
        log.info("[UserService] Gửi OTP đến: {}", request.getEmail());
    }

    // -----------------------------------------------
    // 4. Xác thực OTP — trả về resetToken (10 phút)
    // -----------------------------------------------
    public String verifyOtp(OtpVerifyRequest request) {
        if (!emailService.validateOtp(request.getEmail(), request.getOtp())) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        String resetToken = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(
                RESET_PREFIX + request.getEmail(),
                resetToken,
                Duration.ofMinutes(RESET_TTL_MINUTES)
        );
        log.info("[UserService] OTP hợp lệ, cấp resetToken cho: {}", request.getEmail());
        return resetToken;
    }

    // -----------------------------------------------
    // 5. Đặt lại mật khẩu
    // -----------------------------------------------
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String storedToken = redisTemplate.opsForValue().get(RESET_PREFIX + request.getEmail());
        if (storedToken == null || !storedToken.equals(request.getResetToken())) {
            throw new AppException(ErrorCode.INVALID_RESET_TOKEN);
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.EMAIL_NOT_FOUND));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(Timestamp.from(Instant.now()));
        userRepository.save(user);

        redisTemplate.delete(RESET_PREFIX + request.getEmail());
        log.info("[UserService] Đặt lại mật khẩu: {}", request.getEmail());
    }

    // -----------------------------------------------
    // 6. Refresh access token
    // -----------------------------------------------
    public AuthResponse refresh(RefreshTokenRequest request) {
        String username = redisTemplate.opsForValue()
                .get(REFRESH_PREFIX + request.getRefreshToken());
        if (username == null) {
            throw new AppException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        String newAccessToken   = jwtService.generateAccessToken(userDetails);

        return AuthResponse.builder()
                .tokenType("Bearer")
                .accessToken(newAccessToken)
                .refreshToken(request.getRefreshToken())
                .expiresIn(jwtService.getExpirationMs())
                .build();
    }

    // -----------------------------------------------
    // 7. Đăng xuất
    // -----------------------------------------------
    public void logout(RefreshTokenRequest request) {
        redisTemplate.delete(REFRESH_PREFIX + request.getRefreshToken());
        log.info("[UserService] Đăng xuất: refresh token đã hủy");
    }

    // -----------------------------------------------
    // 8. Lấy thông tin profile
    // -----------------------------------------------
    public UserResponse getProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    // --- Helper ---
    private String generateAndSaveRefreshToken(String username) {
        String token = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(
                REFRESH_PREFIX + token,
                username,
                Duration.ofMillis(refreshExpirationMs)
        );
        return token;
    }
}
