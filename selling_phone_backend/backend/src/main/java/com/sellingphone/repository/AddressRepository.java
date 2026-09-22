package com.sellingphone.repository;

import com.sellingphone.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Integer> {

    /** Lấy tất cả địa chỉ của user, địa chỉ mặc định lên đầu */
    List<Address> findByUser_UsernameOrderByIsDefaultDescAddressIdAsc(String username);

    /** Tìm địa chỉ theo id và username (kiểm tra quyền sở hữu) */
    Optional<Address> findByAddressIdAndUser_Username(Integer addressId, String username);

    /** Bỏ tất cả địa chỉ mặc định của user trước khi set default mới */
    @Modifying
    @Query("UPDATE Address a SET a.isDefault = 0 WHERE a.user.username = :username")
    void clearDefaultByUsername(@Param("username") String username);
}
