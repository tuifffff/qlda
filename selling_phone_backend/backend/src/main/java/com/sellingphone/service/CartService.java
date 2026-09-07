package com.sellingphone.service;

import com.sellingphone.dto.request.CartItemRequest;
import com.sellingphone.dto.response.CartResponse;
import com.sellingphone.entity.*;
import com.sellingphone.exception.AppException;
import com.sellingphone.exception.ErrorCode;
import com.sellingphone.mapper.CartMapper;
import com.sellingphone.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository       cartRepository;
    private final CartDetailRepository cartDetailRepository;
    private final VersionRepository    versionRepository;
    private final UserRepository       userRepository;
    private final CartMapper           cartMapper;

    // -----------------------------------------------
    // 1. Lấy giỏ hàng của chính tôi
    // -----------------------------------------------
    public CartResponse getMyCart(String username) {
        Cart cart = cartRepository.findWithItemsByUsername(username)
                .orElseGet(() -> getOrCreateCart(username));
        log.info("[CartService] Lấy giỏ hàng của: {}", username);
        return cartMapper.toCartResponse(cart);
    }

    // -----------------------------------------------
    // 2. Thêm sản phẩm vào giỏ
    //    - Nếu version đã có trong giỏ → cộng thêm số lượng
    //    - Nếu chưa có → tạo mới CartDetail
    // -----------------------------------------------
    @Transactional
    public CartResponse addToCart(String username, CartItemRequest request) {
        Cart    cart    = getOrCreateCart(username);
        Version version = findVersion(request.getVersionId());

        // Kiểm tra tồn kho
        if (version.getStock() < request.getQuantity()) {
            throw new AppException(ErrorCode.OUT_OF_STOCK);
        }

        CartDetailId detailId = new CartDetailId(cart.getCartId(), version.getVersionId());

        CartDetail detail = cartDetailRepository.findById(detailId)
                .orElse(null);

        if (detail != null) {
            // Đã có → cộng thêm
            int newQty = detail.getQuantity() + request.getQuantity();
            if (version.getStock() < newQty) {
                throw new AppException(ErrorCode.OUT_OF_STOCK);
            }
            detail.setQuantity(newQty);
        } else {
            // Chưa có → tạo mới
            detail = CartDetail.builder()
                    .id(detailId)
                    .cart(cart)
                    .version(version)
                    .quantity(request.getQuantity())
                    .build();
        }

        cartDetailRepository.save(detail);
        log.info("[CartService] Thêm versionId={} x{} vào giỏ của: {}", version.getVersionId(), request.getQuantity(), username);

        // Reload đầy đủ với JOIN FETCH
        Cart updatedCart = cartRepository.findWithItemsByUsername(username).orElseThrow();
        return cartMapper.toCartResponse(updatedCart);
    }

    // -----------------------------------------------
    // 3. Cập nhật số lượng (Nút + - trong giỏ hàng)
    //    - quantity <= 0 → xóa khỏi giỏ
    // -----------------------------------------------
    @Transactional
    public CartResponse updateCartItem(String username, CartItemRequest request) {
        Cart    cart    = getOrCreateCart(username);
        Version version = findVersion(request.getVersionId());

        CartDetailId detailId = new CartDetailId(cart.getCartId(), version.getVersionId());
        CartDetail   detail   = cartDetailRepository.findById(detailId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        if (request.getQuantity() <= 0) {
            cartDetailRepository.delete(detail);
            log.info("[CartService] Xóa versionId={} khỏi giỏ (qty<=0): {}", version.getVersionId(), username);
        } else {
            if (version.getStock() < request.getQuantity()) {
                throw new AppException(ErrorCode.OUT_OF_STOCK);
            }
            detail.setQuantity(request.getQuantity());
            cartDetailRepository.save(detail);
            log.info("[CartService] Cập nhật versionId={} → qty={}: {}", version.getVersionId(), request.getQuantity(), username);
        }

        Cart updatedCart = cartRepository.findWithItemsByUsername(username).orElseThrow();
        return cartMapper.toCartResponse(updatedCart);
    }

    // -----------------------------------------------
    // 4. Xóa sản phẩm khỏi giỏ (Nút xóa)
    // -----------------------------------------------
    @Transactional
    public CartResponse removeFromCart(String username, Integer versionId) {
        Cart cart = getOrCreateCart(username);

        CartDetailId detailId = new CartDetailId(cart.getCartId(), versionId);
        CartDetail   detail   = cartDetailRepository.findById(detailId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        cartDetailRepository.delete(detail);
        log.info("[CartService] Xóa versionId={} khỏi giỏ của: {}", versionId, username);

        Cart updatedCart = cartRepository.findWithItemsByUsername(username).orElseThrow();
        return cartMapper.toCartResponse(updatedCart);
    }

    // --- Helpers ---

    /**
     * Lấy giỏ hàng hiện có của user; nếu chưa có thì tạo mới (lazy init).
     */
    private Cart getOrCreateCart(String username) {
        return cartRepository.findWithItemsByUsername(username)
                .orElseGet(() -> {
                    User user = userRepository.findByUsername(username)
                            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
                    Cart newCart = Cart.builder().user(user).build();
                    Cart saved = cartRepository.save(newCart);
                    log.info("[CartService] Tạo giỏ hàng mới cho: {}", username);
                    return saved;
                });
    }

    private Version findVersion(Integer versionId) {
        return versionRepository.findById(versionId)
                .orElseThrow(() -> new AppException(ErrorCode.VERSION_NOT_FOUND));
    }
}
