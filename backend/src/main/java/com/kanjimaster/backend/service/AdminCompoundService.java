package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.AppException;
import com.kanjimaster.backend.exception.ErrorCode;
import com.kanjimaster.backend.mapper.PagedMapper;
import com.kanjimaster.backend.model.dto.PagedResponse;
import com.kanjimaster.backend.model.dto.admin.CompoundCreateRequest;
import com.kanjimaster.backend.model.dto.admin.CompoundUpdateRequest;
import com.kanjimaster.backend.model.dto.admin.CsvImportResult;
import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.repository.CompoundWordRepository;
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
public class AdminCompoundService {
    static Logger logger = LoggerFactory.getLogger(AdminCompoundService.class);
    
    CompoundWordRepository compoundWordRepository;

    /**
     * Get all compounds with pagination
     */
    public PagedResponse<CompoundWords> getAllCompounds(Pageable pageable) {
        return PagedMapper.map(compoundWordRepository.findAll(pageable));
    }

    /**
     * Get compound by ID
     */
    public CompoundWords getCompoundById(Integer id) {
        return compoundWordRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COMPOUND_NOT_FOUND));
    }

    /**
     * Create new compound
     */
    @Transactional
    public CompoundWords createCompound(CompoundCreateRequest request) {
        // Check duplicate
        if (compoundWordRepository.existsByWord(request.getWord())) {
            throw new AppException(ErrorCode.COMPOUND_ALREADY_EXISTS);
        }

        CompoundWords compound = CompoundWords.builder()
                .word(request.getWord())
                .meaning(request.getMeaning())
                .reading(request.getReading())
                .frequency(request.getFrequency())
                .hiragana(request.getHiragana())
                .example(request.getExample())
                .exampleMeaning(request.getExampleMeaning())
                .build();

        compound = compoundWordRepository.save(compound);
        logger.info("Created compound: {}", compound.getWord());
        return compound;
    }

    /**
     * Update compound
     */
    @Transactional
    public CompoundWords updateCompound(Integer id, CompoundUpdateRequest request) {
        CompoundWords compound = compoundWordRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COMPOUND_NOT_FOUND));

        // Check duplicate if word is changed
        if (request.getWord() != null && !request.getWord().equals(compound.getWord())) {
            if (compoundWordRepository.existsByWord(request.getWord())) {
                throw new AppException(ErrorCode.COMPOUND_ALREADY_EXISTS);
            }
            compound.setWord(request.getWord());
        }

        // Update other fields if provided
        if (request.getMeaning() != null) compound.setMeaning(request.getMeaning());
        if (request.getReading() != null) compound.setReading(request.getReading());
        if (request.getFrequency() != null) compound.setFrequency(request.getFrequency());
        if (request.getHiragana() != null) compound.setHiragana(request.getHiragana());
        if (request.getExample() != null) compound.setExample(request.getExample());
        if (request.getExampleMeaning() != null) compound.setExampleMeaning(request.getExampleMeaning());

        compound = compoundWordRepository.save(compound);
        logger.info("Updated compound ID: {}", id);
        return compound;
    }

    /**
     * Delete compound
     */
    @Transactional
    public void deleteCompound(Integer id) {
        CompoundWords compound = compoundWordRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COMPOUND_NOT_FOUND));
        
        compoundWordRepository.delete(compound);
        logger.info("Deleted compound ID: {}", id);
    }

    /**
     * Import compounds from CSV
     * CSV format: word,meaning,reading,frequency,hiragana,example,exampleMeaning
     */
    @Transactional
    public CsvImportResult importCompoundsFromCsv(MultipartFile file) {
        List<String> errors = new ArrayList<>();
        List<String> skipped = new ArrayList<>();
        int successCount = 0;
        int totalRows = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            
            CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT
                    .builder()
                    .setHeader("word", "meaning", "reading", "frequency", "hiragana", "example", "exampleMeaning")
                    .setSkipHeaderRecord(true)
                    .setIgnoreHeaderCase(true)
                    .setTrim(true)
                    .build());

            for (CSVRecord record : csvParser) {
                totalRows++;
                try {
                    String word = record.get("word");
                    
                    // Validate required fields
                    if (word == null || word.isBlank()) {
                        errors.add("Row " + totalRows + ": Word không được để trống");
                        continue;
                    }

                    // Check duplicate
                    if (compoundWordRepository.existsByWord(word)) {
                        skipped.add("Row " + totalRows + ": Compound '" + word + "' đã tồn tại");
                        continue;
                    }

                    String frequencyStr = record.get("frequency");
                    Integer frequency = null;
                    if (frequencyStr != null && !frequencyStr.isBlank()) {
                        try {
                            frequency = Integer.parseInt(frequencyStr);
                        } catch (NumberFormatException e) {
                            errors.add("Row " + totalRows + ": Frequency không hợp lệ: " + frequencyStr);
                            continue;
                        }
                    }

                    CompoundWords compound = CompoundWords.builder()
                            .word(word)
                            .meaning(record.get("meaning"))
                            .reading(record.get("reading"))
                            .frequency(frequency)
                            .hiragana(record.get("hiragana"))
                            .example(record.get("example"))
                            .exampleMeaning(record.get("exampleMeaning"))
                            .build();

                    compoundWordRepository.save(compound);
                    successCount++;

                } catch (Exception e) {
                    errors.add("Row " + totalRows + ": " + e.getMessage());
                }
            }

        } catch (Exception e) {
            logger.error("Error importing compounds from CSV", e);
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
                .message(String.format("Imported %d compounds successfully", successCount))
                .build();
    }
}
