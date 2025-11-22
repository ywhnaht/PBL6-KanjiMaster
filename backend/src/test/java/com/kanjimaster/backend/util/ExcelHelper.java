package com.kanjimaster.backend.util;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.stream.Stream;

public class ExcelHelper {
    public static class TestResult {
        public String id;
        public String description;
        public Map<String, String> inputs;
        public String expectedStatus;
        public String actualStatus;
        public String actualMessage;
        public String status;
        public List<String> inputHeaders; // Thêm headers riêng cho mỗi result

        public TestResult(String id, String desc, Map<String, String> inputs,
                          List<String> inputHeaders, String expectedStatus,
                          String actualStatus, String actualMessage, String status) {
            this.id = id;
            this.description = desc;
            this.inputs = inputs;
            this.inputHeaders = new ArrayList<>(inputHeaders);
            this.expectedStatus = expectedStatus;
            this.actualStatus = actualStatus;
            this.actualMessage = actualMessage;
            this.status = status;
        }
    }

    public static Stream<Object[]> getTestData(String fileName) throws IOException {
        List<Object[]> testData = new ArrayList<>();
        String filePath = "src/test/java/resources/test_data/" + fileName;

        try (FileInputStream fis = new FileInputStream(new File(filePath));
             Workbook workbook = new XSSFWorkbook(fis)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            if (!rowIterator.hasNext()) return testData.stream();

            Row headerRow = rowIterator.next();
            List<String> inputHeaders = new ArrayList<>();
            int lastInputCol = headerRow.getLastCellNum() - 2;

            for (int i = 2; i <= lastInputCol; i++) {
                Cell cell = headerRow.getCell(i);
                if (cell != null) {
                    inputHeaders.add(getCellValue(cell));
                }
            }

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                if (row.getCell(0) == null) continue;

                Object[] testCase = new Object[2 + inputHeaders.size() + 2];
                testCase[0] = getCellValue(row.getCell(0));
                testCase[1] = getCellValue(row.getCell(1));

                for (int i = 0; i < inputHeaders.size(); i++) {
                    testCase[2 + i] = getCellValue(row.getCell(2 + i));
                }

                testCase[testCase.length - 2] = new ArrayList<>(inputHeaders);
                testCase[testCase.length - 1] = getCellValue(row.getCell(row.getLastCellNum() - 1));

                testData.add(testCase);
            }
        }
        return testData.stream();
    }

    public static Stream<Object[]> getSearchTestData(String fileName) throws IOException {
        List<Object[]> testData = new ArrayList<>();
        String filePath = "src/test/java/resources/test_data/" + fileName;

        try (FileInputStream fis = new FileInputStream(new File(filePath));
             Workbook workbook = new XSSFWorkbook(fis)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            if (!rowIterator.hasNext()) return testData.stream();

            rowIterator.next(); // Skip header row

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                if (row.getCell(0) == null) continue;

                // Cấu trúc: [ID, Description, Query, Expected Type, Expected Status]
                Object[] testCase = new Object[5];
                testCase[0] = getCellValue(row.getCell(0)); // ID
                testCase[1] = getCellValue(row.getCell(1)); // Description
                testCase[2] = getCellValue(row.getCell(2)); // Query
                testCase[3] = getCellValue(row.getCell(3)); // Expected Type
                testCase[4] = getCellValue(row.getCell(4)); // Expected Status

                testData.add(testCase);
            }
        }
        return testData.stream();
    }

    public static void writeReport(String fileName, List<TestResult> results) {
        if (results.isEmpty()) return;

        String filePath = "src/test/java/resources/test_reports/" + fileName;
        new File("src/test/java/resources/test_reports").mkdirs();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Test Report");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            List<String> inputHeaders = results.get(0).inputHeaders;

            Row header = sheet.createRow(0);
            List<String> headers = new ArrayList<>();
            headers.add("ID");
            headers.add("Mô tả");
            headers.addAll(inputHeaders);
            headers.add("HTTP Status mong đợi");
            headers.add("HTTP Status thực tế");
            headers.add("Message từ BE");
            headers.add("Trạng thái");

            for (int i = 0; i < headers.size(); i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(headers.get(i));
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            for (TestResult res : results) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;

                row.createCell(colNum++).setCellValue(res.id);
                row.createCell(colNum++).setCellValue(res.description);

                for (String headerName : res.inputHeaders) {
                    String value = res.inputs.getOrDefault(headerName, "");
                    row.createCell(colNum++).setCellValue(value);
                }

                row.createCell(colNum++).setCellValue(res.expectedStatus);
                row.createCell(colNum++).setCellValue(res.actualStatus);
                row.createCell(colNum++).setCellValue(res.actualMessage);

                Cell statusCell = row.createCell(colNum);
                statusCell.setCellValue(res.status);

                CellStyle statusStyle = workbook.createCellStyle();
                Font statusFont = workbook.createFont();
                if ("PASS".equals(res.status)) {
                    statusFont.setColor(IndexedColors.GREEN.getIndex());
                } else {
                    statusFont.setColor(IndexedColors.RED.getIndex());
                }
                statusStyle.setFont(statusFont);
                statusCell.setCellStyle(statusStyle);
            }

            for(int i = 0; i < headers.size(); i++) {
                sheet.autoSizeColumn(i);
            }

            try (FileOutputStream fos = new FileOutputStream(filePath)) {
                workbook.write(fos);
            }
            System.out.println(">> Đã xuất báo cáo: " + filePath);

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static String getCellValue(Cell cell) {
        if (cell == null) return "";

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (cell.getNumericCellValue() == Math.floor(cell.getNumericCellValue())) {
                    return String.valueOf((int) cell.getNumericCellValue());
                }
                return String.valueOf(cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }
}
