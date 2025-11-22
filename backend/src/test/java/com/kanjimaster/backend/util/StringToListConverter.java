package com.kanjimaster.backend.util;

import org.junit.jupiter.api.extension.ParameterContext;
import org.junit.jupiter.params.converter.ArgumentConversionException;
import org.junit.jupiter.params.converter.ArgumentConverter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class StringToListConverter implements ArgumentConverter {
    @Override
    public Object convert(Object source, ParameterContext context) throws ArgumentConversionException {
        if (source == null) {
            return new ArrayList<>();
        }

        if (source instanceof List) {
            return source;
        }

        if (source instanceof String) {
            String str = (String) source;
            if (str.isEmpty()) {
                return new ArrayList<>();
            }
            // Nếu là danh sách phân cách bằng dấu phẩy
            if (str.contains(",")) {
                return Arrays.asList(str.split(","));
            }
            // Nếu là chuỗi đơn
            return Arrays.asList(str);
        }

        throw new ArgumentConversionException("Cannot convert " + source + " to List");
    }
}
