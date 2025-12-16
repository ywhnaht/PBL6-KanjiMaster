package com.kanjimaster.backend.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import com.kanjimaster.backend.exception.AppException;
import com.kanjimaster.backend.exception.ErrorCode;
import com.kanjimaster.backend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryFileStorageService implements FileStorageService {

    private final Cloudinary cloudinary;

    @Override
    public String uploadFile(MultipartFile file, String folder) {
        try {
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String uniqueFileName = UUID.randomUUID().toString();

            // Upload parameters - SỬA LẠI PHẦN NÀY
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", folder,
                    "public_id", uniqueFileName,
                    "resource_type", "image",
                    "context", "original_name=" + originalFilename,
                    "eager_async", true,
                    "eager", java.util.Collections.singletonList(
                            new Transformation()
                                    .width(500)
                                    .height(500)
                                    .crop("limit")
                                    .quality("auto")
                                    .fetchFormat("auto")
                    )
            );

            // Upload to Cloudinary
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            String secureUrl = (String) uploadResult.get("secure_url");

            log.info("File uploaded successfully: {}", secureUrl);
            return secureUrl;

        } catch (IOException e) {
            log.error("Failed to upload file: {}", e.getMessage());
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        try {
            // Extract public_id from URL
            // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
            String publicId = extractPublicIdFromUrl(fileUrl);

            if (publicId != null && !publicId.isEmpty()) {
                Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                log.info("File deleted successfully: {}", publicId);
            }

        } catch (Exception e) {
            log.error("Failed to delete file: {}", e.getMessage());
            // Không throw exception để tránh làm gián đoạn flow chính
        }
    }

    /**
     * Extract public_id from Cloudinary URL
     * Example: https://res.cloudinary.com/demo/image/upload/v1234567890/avatars/abc-123.jpg
     * => avatars/abc-123
     */
    private String extractPublicIdFromUrl(String url) {
        if (url == null || !url.contains("cloudinary.com")) {
            return null;
        }

        try {
            // Split by "/upload/"
            String[] parts = url.split("/upload/");
            if (parts.length < 2) return null;

            // Get part after /upload/v{version}/
            String afterUpload = parts[1];

            // Remove version number (v1234567890/)
            String withoutVersion = afterUpload.replaceFirst("v\\d+/", "");

            // Remove file extension
            int lastDot = withoutVersion.lastIndexOf('.');
            if (lastDot > 0) {
                withoutVersion = withoutVersion.substring(0, lastDot);
            }

            return withoutVersion;

        } catch (Exception e) {
            log.error("Failed to extract public_id from URL: {}", url);
            return null;
        }
    }
}