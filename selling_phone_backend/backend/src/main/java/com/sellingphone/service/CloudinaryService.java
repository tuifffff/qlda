package com.sellingphone.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * CloudinaryService: xử lý upload/xóa ảnh trên Cloudinary.
 * URL trả về được lưu vào DB (avatar column).
 */
@Slf4j
@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}")    String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key",    apiKey,
                "api_secret", apiSecret,
                "secure",     true
        ));
    }

    /**
     * Upload ảnh lên Cloudinary.
     *
     * @param file   file ảnh từ multipart request
     * @param folder thư mục lưu trên Cloudinary (vd: "avatars")
     * @return URL public của ảnh
     */
    public String uploadImage(MultipartFile file, String folder) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder",        folder,
                            "resource_type", "image"
                    )
            );
            String url = (String) result.get("secure_url");
            log.info("[Cloudinary] Upload thành công: {}", url);
            return url;
        } catch (IOException e) {
            log.error("[Cloudinary] Lỗi upload ảnh: {}", e.getMessage());
            throw new RuntimeException("Không thể upload ảnh, vui lòng thử lại sau");
        }
    }

    /**
     * Xóa ảnh trên Cloudinary theo publicId.
     * publicId là phần path không có extension, vd: "avatars/user_123"
     *
     * @param publicId public ID của ảnh cần xóa
     */
    public void deleteImage(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("[Cloudinary] Xóa ảnh: {}", publicId);
        } catch (IOException e) {
            log.warn("[Cloudinary] Không thể xóa ảnh {}: {}", publicId, e.getMessage());
        }
    }
}
