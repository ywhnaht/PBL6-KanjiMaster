package com.kanjimaster.backend.util;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

public final class SearchUtils {

    private SearchUtils() {}

    public static List<String> extractKeywords(String text) {
        if (text == null || text.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.asList(text.toLowerCase(Locale.ROOT).split("\\s+"));
    }

    public static int countCommonKeywords(List<String> keywords1, List<String> keywords2) {
        List<String> common = new ArrayList<>(keywords1);
        common.retainAll(keywords2);
        return common.size();
    }

    public static int rank(String query, String primary, String secondary) {
        String lowerQuery = query.toLowerCase(Locale.ROOT);
        List<String> queryTokens = extractKeywords(lowerQuery);
        int score = 0;

        // --- 1. Xếp hạng dựa trên văn bản chính (primary - tiếng Nhật) ---
        if (primary != null) {
            String lowerPrimary = primary.toLowerCase(Locale.ROOT);

            if (lowerPrimary.equals(lowerQuery)) score += 100; // Khớp chính xác
            if (lowerPrimary.startsWith(lowerQuery)) score += 50; // Khớp đầu chuỗi

            List<String> primaryTokens = extractKeywords(lowerPrimary);

            // Cộng điểm cho từ khóa chung
            score += countCommonKeywords(queryTokens, primaryTokens) * 10;

            // Cộng điểm nếu token trong primary bắt đầu bằng token trong query
            boolean anyPrimaryTokenStartsWithQuery = queryTokens.stream()
                    .anyMatch(qToken -> primaryTokens.stream().anyMatch(pToken -> pToken.startsWith(qToken)));
            if (anyPrimaryTokenStartsWithQuery) {
                score += 25;
            }
        }

        // --- 2. Xếp hạng dựa trên văn bản phụ (secondary - tiếng Việt) ---
        //    Điểm số ở đây sẽ thấp hơn để ưu tiên kết quả tiếng Nhật khi tìm bằng tiếng Nhật,
        //    nhưng vẫn đủ cao để hoạt động tốt khi tìm bằng tiếng Việt.
        if (secondary != null) {
            String lowerSecondary = secondary.toLowerCase(Locale.ROOT);

            if (lowerSecondary.equals(lowerQuery)) score += 95; // Khớp chính xác (điểm gần bằng primary)
            if (lowerSecondary.startsWith(lowerQuery)) score += 45; // Khớp đầu chuỗi

            List<String> secondaryTokens = extractKeywords(lowerSecondary);

            // Cộng điểm cho từ khóa chung (trọng số thấp hơn primary một chút)
            score += countCommonKeywords(queryTokens, secondaryTokens) * 8;

            // Cộng điểm nếu token trong secondary bắt đầu bằng token trong query
            boolean anySecondaryTokenStartsWithQuery = queryTokens.stream()
                    .anyMatch(qToken -> secondaryTokens.stream().anyMatch(sToken -> sToken.startsWith(qToken)));
            if (anySecondaryTokenStartsWithQuery) {
                score += 20;
            }
        }

        return score;
    }
}