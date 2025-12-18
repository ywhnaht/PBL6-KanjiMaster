package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.AppException;
import com.kanjimaster.backend.exception.ErrorCode;
import com.kanjimaster.backend.mapper.PagedMapper;
import com.kanjimaster.backend.model.dto.PagedResponse;
import com.kanjimaster.backend.model.dto.admin.CsvImportResult;
import com.kanjimaster.backend.model.dto.admin.KanjiCreateRequest;
import com.kanjimaster.backend.model.dto.admin.KanjiUpdateRequest;
import com.kanjimaster.backend.model.entity.Kanji;
import com.kanjimaster.backend.repository.KanjiRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminKanjiService {
    static Logger logger = LoggerFactory.getLogger(AdminKanjiService.class);
    
    KanjiRepository kanjiRepository;

    /**
     * Get all kanji with pagination
     */
    public PagedResponse<Kanji> getAllKanji(Pageable pageable) {
        return PagedMapper.map(kanjiRepository.findAll(pageable));
    }

    /**
     * Get kanji by ID
     */
    public Kanji getKanjiById(Integer id) {
        return kanjiRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.KANJI_NOT_FOUND));
    }

    /**
     * Create new kanji
     */
    @Transactional
    public Kanji createKanji(KanjiCreateRequest request) {
        // Check duplicate
        if (kanjiRepository.existsByKanji(request.getKanji())) {
            throw new AppException(ErrorCode.KANJI_ALREADY_EXISTS);
        }

        Kanji kanji = Kanji.builder()
                .kanji(request.getKanji())
                .hanViet(request.getHanViet())
                .joyoReading(request.getJoyoReading())
                .kunyomi(request.getKunyomi())
                .onyomi(request.getOnyomi())
                .level(request.getLevel())
                .radical(request.getRadical())
                .strokes(request.getStrokes())
                .svgLink(request.getSvgLink())
                .build();

        kanji = kanjiRepository.save(kanji);
        logger.info("Created kanji: {}", kanji.getKanji());
        return kanji;
    }

    /**
     * Update kanji
     */
    @Transactional
    public Kanji updateKanji(Integer id, KanjiUpdateRequest request) {
        Kanji kanji = kanjiRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.KANJI_NOT_FOUND));

        // Check duplicate if kanji character is changed
        if (request.getKanji() != null && !request.getKanji().equals(kanji.getKanji())) {
            if (kanjiRepository.existsByKanji(request.getKanji())) {
                throw new AppException(ErrorCode.KANJI_ALREADY_EXISTS);
            }
            kanji.setKanji(request.getKanji());
        }

        // Update other fields if provided
        if (request.getHanViet() != null) kanji.setHanViet(request.getHanViet());
        if (request.getJoyoReading() != null) kanji.setJoyoReading(request.getJoyoReading());
        if (request.getKunyomi() != null) kanji.setKunyomi(request.getKunyomi());
        if (request.getOnyomi() != null) kanji.setOnyomi(request.getOnyomi());
        if (request.getLevel() != null) kanji.setLevel(request.getLevel());
        if (request.getRadical() != null) kanji.setRadical(request.getRadical());
        if (request.getStrokes() != null) kanji.setStrokes(request.getStrokes());
        if (request.getSvgLink() != null) kanji.setSvgLink(request.getSvgLink());

        kanji = kanjiRepository.save(kanji);
        logger.info("Updated kanji ID: {}", id);
        return kanji;
    }

    /**
     * Delete kanji
     */
    @Transactional
    public void deleteKanji(Integer id) {
        Kanji kanji = kanjiRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.KANJI_NOT_FOUND));
        
        kanjiRepository.delete(kanji);
        logger.info("Deleted kanji ID: {}", id);
    }

    /**
     * Import kanji from CSV
     * CSV format: kanji,hanViet,joyoReading,kunyomi,onyomi,level,radical,strokes,svgLink
     */
    @Transactional
    public CsvImportResult importKanjiFromCsv(MultipartFile file) {
        List<String> errors = new ArrayList<>();
        List<String> skipped = new ArrayList<>();
        int successCount = 0;
        int totalRows = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            
            CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT
                    .builder()
                    .setHeader("kanji", "hanViet", "joyoReading", "kunyomi", "onyomi", "level", "radical", "strokes", "svgLink")
                    .setSkipHeaderRecord(true)
                    .setIgnoreHeaderCase(true)
                    .setTrim(true)
                    .build());

            for (CSVRecord record : csvParser) {
                totalRows++;
                try {
                    String kanjiChar = record.get("kanji");
                    
                    // Validate required fields
                    if (kanjiChar == null || kanjiChar.isBlank()) {
                        errors.add("Row " + totalRows + ": Kanji character không được để trống");
                        continue;
                    }

                    // Check duplicate
                    if (kanjiRepository.existsByKanji(kanjiChar)) {
                        skipped.add("Row " + totalRows + ": Kanji '" + kanjiChar + "' đã tồn tại");
                        continue;
                    }

                    Kanji kanji = Kanji.builder()
                            .kanji(kanjiChar)
                            .hanViet(record.get("hanViet"))
                            .joyoReading(record.get("joyoReading"))
                            .kunyomi(record.get("kunyomi"))
                            .onyomi(record.get("onyomi"))
                            .level(record.get("level"))
                            .radical(record.get("radical"))
                            .strokes(record.get("strokes"))
                            .svgLink(record.get("svgLink"))
                            .build();

                    kanjiRepository.save(kanji);
                    successCount++;

                } catch (Exception e) {
                    errors.add("Row " + totalRows + ": " + e.getMessage());
                }
            }

        } catch (Exception e) {
            logger.error("Error importing kanji from CSV", e);
            throw new AppException(ErrorCode.INVALID_INPUT);
        }

        logger.info("CSV Import completed: {} success, {} skipped, {} errors out of {} rows",
                successCount, skipped.size(), errors.size(), totalRows);

        return CsvImportResult.builder()
                .totalRows(totalRows)
                .successCount(successCount)
                .skipCount(skipped.size())
                .errorCount(errors.size())
                .errors(errors)
                .skipped(skipped)
                .message(String.format("Imported %d kanji successfully", successCount))
                .build();
    }
}
