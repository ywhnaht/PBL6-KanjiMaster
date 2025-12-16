package com.kanjimaster.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    /**
     * Upload file to cloud storage
     * @param file MultipartFile từ request
     * @param folder Thư mục lưu trữ (vd: "avatars", "kanji-images")
     * @return URL của file đã upload
     */
    String uploadFile(MultipartFile file, String folder);

    /**
     * Delete file from cloud storage
     * @param fileUrl URL của file cần xóa
     */
    void deleteFile(String fileUrl);
}