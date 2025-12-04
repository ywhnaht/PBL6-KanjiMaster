package com.kanjimaster.backend.mapper;

import com.kanjimaster.backend.model.dto.NotebookDetailDto;
import com.kanjimaster.backend.model.dto.NotebookDto;
import com.kanjimaster.backend.model.dto.NotebookEntryResponse;
import com.kanjimaster.backend.model.entity.Notebook;
import com.kanjimaster.backend.model.entity.NotebookEntry;
import com.kanjimaster.backend.model.entity.NotebookEntryType; // Đảm bảo đã import Enum này
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class NotebookMapper {
    public abstract NotebookDto toNotebookDto(Notebook notebook);
    public abstract List<NotebookDto> toNotebookDtoList(List<Notebook> notebooks);

    @Mapping(target = "totalEntries", expression = "java(calculateTotalEntries(notebook))")
    @Mapping(target = "entries", source = "notebookEntries")
    public abstract NotebookDetailDto toDetailDto(Notebook notebook);

    protected Integer calculateTotalEntries(Notebook notebook) {
        if (notebook.getNotebookEntries() == null) return 0;
        return notebook.getNotebookEntries().size();
    }

    @BeanMapping(builder = @Builder(disableBuilder = true))
    @Mapping(target = "entryId", source = "id")
    @Mapping(target = "text", ignore = true)
    @Mapping(target = "meaning", ignore = true)
    @Mapping(target = "entityId", ignore = true)
    public abstract NotebookEntryResponse toEntryResponse(NotebookEntry entry);

    @AfterMapping
    protected void fillDetails(NotebookEntry source, @MappingTarget NotebookEntryResponse target) {
        if (source.getEntityType() == NotebookEntryType.KANJI && source.getKanji() != null) {
            target.setEntityId(source.getKanji().getId());

            target.setText(source.getKanji().getKanji());
            target.setMeaning(source.getKanji().getHanViet());
        }
        else if (source.getEntityType() == NotebookEntryType.COMPOUND && source.getCompoundWords() != null) {
            target.setEntityId(source.getCompoundWords().getId());

            target.setText(source.getCompoundWords().getWord());
            target.setMeaning(source.getCompoundWords().getMeaning());
        }
    }

    public abstract List<NotebookEntryResponse> toEntryResponseList(List<NotebookEntry> entries);
}