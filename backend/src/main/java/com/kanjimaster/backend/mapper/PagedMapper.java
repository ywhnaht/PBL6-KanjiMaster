package com.kanjimaster.backend.mapper;

import com.kanjimaster.backend.model.dto.PagedResponse;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

//@Mapper(componentModel = "spring")
public interface PagedMapper {
    public static <E, D> PagedResponse<D> map(Page<E> entities, Function<E, D> converter) {
        List<D> dtoList = entities.map(converter).getContent();

        return new PagedResponse<>(
                dtoList,
                entities.getNumber(),
                entities.getTotalPages(),
                entities.getTotalElements(),
                entities.getSize()
        );
    }

    public static <E> PagedResponse<E> map(Page<E> entities) {
        return new PagedResponse<>(
                entities.getContent(),
                entities.getNumber(),
                entities.getTotalPages(),
                entities.getTotalElements(),
                entities.getSize()
        );
    }
}
