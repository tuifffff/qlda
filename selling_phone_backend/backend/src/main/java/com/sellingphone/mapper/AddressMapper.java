package com.sellingphone.mapper;

import com.sellingphone.dto.response.AddressResponse;
import com.sellingphone.entity.Address;
import org.springframework.stereotype.Component;

/**
 * AddressMapper: chuyển đổi Address entity → AddressResponse DTO.
 */
@Component
public class AddressMapper {

    public AddressResponse toAddressResponse(Address address) {
        return AddressResponse.builder()
                .addressId(address.getAddressId())
                .street(address.getStreet())
                .district(address.getDistrict())
                .city(address.getCity())
                .isDefault(address.getIsDefault() != null && address.getIsDefault() == 1)
                .build();
    }
}
