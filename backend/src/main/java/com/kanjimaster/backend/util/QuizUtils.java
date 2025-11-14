package com.kanjimaster.backend.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class QuizUtils {
    private static final Pattern OKURIGANA_PATTERN = Pattern.compile("[\u3040-\u309F]+$");

    public static String getOkuriganaSuffix(String word) {
        if (word == null || word.isEmpty()) return "";
        Matcher matcher = OKURIGANA_PATTERN.matcher(word);
        if (matcher.find()) {
            return matcher.group();
        }
        return "";
    }

    public static String getCompoundReadingSuffix(String reading) {
        if (reading == null || reading.isEmpty()) return "";

        if (reading.length() <= 2) {
            return reading;
        }

        return reading.substring(reading.length() - 2);
    }

    public static String highlightTargetWord(String sentence, String target) {
        if (sentence == null || target == null) return "";
        return sentence.replace(target, "<u>" + target + "</u>");
    }
}
