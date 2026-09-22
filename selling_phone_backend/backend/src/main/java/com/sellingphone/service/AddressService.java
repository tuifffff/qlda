package com.sellingphone.service;

import com.sellingphone.dto.request.AddressRequest;
import com.sellingphone.dto.response.AddressResponse;
import com.sellingphone.entity.Address;
import com.sellingphone.entity.User;
import com.sellingphone.exception.AppException;
import com.sellingphone.exception.ErrorCode;
import com.sellingphone.mapper.AddressMapper;
import com.sellingphone.repository.AddressRepository;
import com.sellingphone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository    userRepository;
    private final AddressMapper     addressMapper;

    // -----------------------------------------------
    // 1. Lấy danh sách địa chỉ của tôi
    //    Địa chỉ mặc định luôn lên đầu
    // -----------------------------------------------
    public List<AddressResponse> getMyAddresses(String username) {
        List<Address> addresses = addressRepository
                .findByUser_UsernameOrderByIsDefaultDescAddressIdAsc(username);
        log.info("[Address] Lấy {} địa chỉ của: {}", addresses.size(), username);
        return addresses.stream().map(addressMapper::toAddressResponse).toList();
    }

    // -----------------------------------------------
    // 2. Thêm địa chỉ mới
    //    Nếu là địa chỉ đầu tiên → tự động set default
    // -----------------------------------------------
    @Transactional
    public AddressResponse addAddress(String username, AddressRequest request) {
        User user = findUser(username);

        // Tự động set default nếu user chưa có địa chỉ nào
        boolean isFirst = addressRepository
                .findByUser_UsernameOrderByIsDefaultDescAddressIdAsc(username).isEmpty();

        Address address = Address.builder()
                .user(user)
                .street(request.getStreet())
                .district(request.getDistrict())
                .city(request.getCity())
                .isDefault(isFirst ? (byte) 1 : (byte) 0)
                .build();

        Address saved = addressRepository.save(address);
        log.info("[Address] Thêm địa chỉ mới cho: {}", username);
        return addressMapper.toAddressResponse(saved);
    }

    // -----------------------------------------------
    // 3. Cập nhật địa chỉ
    //    Chỉ owner mới được sửa
    // -----------------------------------------------
    @Transactional
    public AddressResponse updateAddress(String username, Integer addressId, AddressRequest request) {
        Address address = findAddressOfUser(username, addressId);

        address.setStreet(request.getStreet());
        address.setDistrict(request.getDistrict());
        address.setCity(request.getCity());

        Address saved = addressRepository.save(address);
        log.info("[Address] Cập nhật địa chỉ id={} của: {}", addressId, username);
        return addressMapper.toAddressResponse(saved);
    }

    // -----------------------------------------------
    // 4. Đặt địa chỉ làm mặc định
    //    Bỏ default cũ → set default mới trong 1 transaction
    // -----------------------------------------------
    @Transactional
    public AddressResponse setDefault(String username, Integer addressId) {
        Address address = findAddressOfUser(username, addressId);

        // Bỏ tất cả default cũ trước
        addressRepository.clearDefaultByUsername(username);

        address.setIsDefault((byte) 1);
        Address saved = addressRepository.save(address);
        log.info("[Address] Đặt địa chỉ id={} làm mặc định cho: {}", addressId, username);
        return addressMapper.toAddressResponse(saved);
    }

    // -----------------------------------------------
    // 5. Xóa địa chỉ
    //    Nếu xóa địa chỉ default → tự động set địa chỉ
    //    đầu tiên còn lại làm default (nếu có)
    // -----------------------------------------------
    @Transactional
    public void deleteAddress(String username, Integer addressId) {
        Address address = findAddressOfUser(username, addressId);
        boolean wasDefault = address.getIsDefault() != null && address.getIsDefault() == 1;

        addressRepository.delete(address);
        log.info("[Address] Xóa địa chỉ id={} của: {}", addressId, username);

        // Nếu vừa xóa địa chỉ default → set default cho địa chỉ kế tiếp
        if (wasDefault) {
            List<Address> remaining = addressRepository
                    .findByUser_UsernameOrderByIsDefaultDescAddressIdAsc(username);
            if (!remaining.isEmpty()) {
                Address next = remaining.get(0);
                next.setIsDefault((byte) 1);
                addressRepository.save(next);
                log.info("[Address] Tự động set default → id={}", next.getAddressId());
            }
        }
    }

    // --- Helpers ---

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    /**
     * Tìm địa chỉ và kiểm tra quyền sở hữu.
     * Ném ADDRESS_ACCESS_DENIED nếu địa chỉ không thuộc user này.
     */
    private Address findAddressOfUser(String username, Integer addressId) {
        return addressRepository
                .findByAddressIdAndUser_Username(addressId, username)
                .orElseThrow(() -> {
                    // Phân biệt: không tồn tại vs không có quyền
                    if (addressRepository.existsById(addressId)) {
                        return new AppException(ErrorCode.ADDRESS_ACCESS_DENIED);
                    }
                    return new AppException(ErrorCode.ADDRESS_NOT_FOUND);
                });
    }
}
