package com.kanjimaster.backend.service;

import com.kanjimaster.backend.exception.AppException;
import com.kanjimaster.backend.exception.ErrorCode;
import com.kanjimaster.backend.model.dto.LoginDto;
import com.kanjimaster.backend.model.dto.RegisterDto;
import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.model.entity.Kanji;
import com.kanjimaster.backend.model.entity.Role;
import com.kanjimaster.backend.model.entity.User;
import com.kanjimaster.backend.repository.CompoundWordRepository;
import com.kanjimaster.backend.repository.KanjiRepository;
import com.kanjimaster.backend.repository.RoleRepository;
import com.kanjimaster.backend.repository.UserRepository;
import com.kanjimaster.backend.util.ExcelHelper;
import com.kanjimaster.backend.util.ExcelHelper.TestResult;
import com.kanjimaster.backend.util.StringToListConverter;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.converter.ConvertWith;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private EmailService emailService;
    @Mock private KanjiRepository kanjiRepository;
    @Mock private CompoundWordRepository compoundWordRepository;
    @Mock private RedisTemplate<String, String> redisTemplate;
    @Mock private ValueOperations<String, String> valueOperations;
    @Mock private Validator validator;

    @InjectMocks private AuthService authService;

    private List<TestResult> results = new ArrayList<>();
    private List<TestResult> loginResults = new ArrayList<>();
    private List<TestResult> searchResults = new ArrayList<>();

    private static final List<String> EXISTING_EMAILS_IN_DB = Arrays.asList(
            "hothanhhuy@gmail.com",
            "admin@kanjimaster.com"
    );

    private static final Map<String, User> USERS_IN_DB = new HashMap<>();
    private static final Map<String, String> PASSWORD_MAP = new HashMap<>();

    private static final List<Kanji> MOCK_KANJIS = new ArrayList<>();
    private static final List<CompoundWords> MOCK_COMPOUNDS = new ArrayList<>();

    static {
        User user1 = new User();
        user1.setEmail("hothanhhuy@gmail.com");
        user1.setPassword("$2a$10$n3TNojcoeBZh3Li3lidr9.6IxDb4Ha72LmWSvNOBH54XIVeuNRu2K");
        user1.setVerified(true);
        USERS_IN_DB.put("hothanhhuy@gmail.com", user1);
        PASSWORD_MAP.put("huyho2004", "$2a$10$n3TNojcoeBZh3Li3lidr9.6IxDb4Ha72LmWSvNOBH54XIVeuNRu2K");

        User user2 = new User();
        user2.setEmail("sontung2000@gmail.com");
        user2.setPassword("$2a$10$28rLv03EJmqntqCUzZXG8uQRZHiqCS.s10qWoYnIrqE3ljFY.f6Qe");
        user2.setVerified(false);
        USERS_IN_DB.put("sontung2000@gmail.com", user2);
        PASSWORD_MAP.put("12345678", "$2a$10$28rLv03EJmqntqCUzZXG8uQRZHiqCS.s10qWoYnIrqE3ljFY.f6Qe");
    }

    static {
        // Mock Kanji: 愛 (ai)
        Kanji k1 = new Kanji();
        k1.setId(1);
        k1.setKanji("愛");
        k1.setHanViet("ái");
        k1.setJoyoReading("アイ、いとしい");
        MOCK_KANJIS.add(k1);

        // Mock Kanji: 情 (tình)
        Kanji k2 = new Kanji();
        k2.setId(2);
        k2.setKanji("情");
        k2.setHanViet("tình");
        k2.setJoyoReading("ジョウ、なさけ");
        MOCK_KANJIS.add(k2);

        // Mock CompoundWord: 愛情 (tình yêu)
        CompoundWords cw1 = new CompoundWords();
        cw1.setId(1);
        cw1.setWord("愛情");
        cw1.setHiragana("あいじょう");
        cw1.setMeaning("tình yêu");
        MOCK_COMPOUNDS.add(cw1);

        // Mock CompoundWord: 愛好 (yêu thích)
        CompoundWords cw2 = new CompoundWords();
        cw2.setId(2);
        cw2.setWord("愛好");
        cw2.setHiragana("あいこう");
        cw2.setMeaning("yêu thích");
        MOCK_COMPOUNDS.add(cw2);
    }

    @BeforeAll
    void setup() {
        MockitoAnnotations.openMocks(this);

        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();

        Mockito.when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        Mockito.when(valueOperations.get(Mockito.anyString()))
                .thenAnswer(invocation -> {
                    String key = invocation.getArgument(0);
                    if (key.startsWith("verify:token:")) {
                        String token = key.replace("verify:token:", "");
                        if ("VALID_TOKEN_123".equals(token)) return "hothanhhuy@gmail.com";
                    } else if (key.startsWith("refreshtoken:")) {
                        String email = key.replace("refreshtoken:", "");
                        return USERS_IN_DB.containsKey(email) ? "mock_refresh_token" : null;
                    }
                    return null;
                });

        Mockito.doNothing().when(valueOperations).set(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyLong(), Mockito.any(TimeUnit.class));

        Mockito.when(userRepository.existsByEmail(Mockito.anyString()))
                .thenAnswer(invocation -> EXISTING_EMAILS_IN_DB.contains(invocation.getArgument(0)));

        Mockito.when(userRepository.findByEmail(Mockito.anyString()))
                .thenAnswer(invocation -> Optional.ofNullable(USERS_IN_DB.get(invocation.getArgument(0))));

        Role mockRole = new Role(); mockRole.setName("USER");
        Mockito.when(roleRepository.findByName("USER")).thenReturn(Optional.of(mockRole));

        Mockito.when(passwordEncoder.encode(Mockito.anyString()))
                .thenAnswer(invocation -> "$2a$10$" + invocation.getArgument(0));

        Mockito.when(passwordEncoder.matches(Mockito.anyString(), Mockito.anyString()))
                .thenAnswer(invocation -> {
                    String raw = invocation.getArgument(0);
                    String encoded = invocation.getArgument(1);
                    return PASSWORD_MAP.getOrDefault(raw, "").equals(encoded);
                });

        Mockito.when(userRepository.save(Mockito.any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Mockito.doNothing().when(emailService).sendVerificationEmail(Mockito.anyString(), Mockito.anyString());

        // Mock Search - SỬA LẠI LOGIC
        Mockito.when(kanjiRepository.findTop2ByKanjiContainingOrHanVietContaining(
                        Mockito.anyString(), Mockito.anyString()))
                .thenAnswer(invocation -> {
                    String q = invocation.getArgument(0);
                    return MOCK_KANJIS.stream()
                            .filter(k -> k.getKanji().contains(q) || k.getHanViet().contains(q))
                            .limit(2)
                            .toList();
                });

        Mockito.when(compoundWordRepository.findTop3ByWordContainingOrMeaningContainingOrHiraganaContaining(
                        Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
                .thenAnswer(invocation -> {
                    String q = invocation.getArgument(0);
                    return MOCK_COMPOUNDS.stream()
                            .filter(c -> c.getWord().contains(q)
                                    || (c.getMeaning() != null && c.getMeaning().contains(q))
                                    || (c.getHiragana() != null && c.getHiragana().contains(q)))
                            .limit(3)
                            .toList();
                });
    }


    private Stream<Object[]> getAuthData() throws IOException {
        return ExcelHelper.getTestData("register_data.xlsx");
    }

    @ParameterizedTest(name = "{0}: {1}")
    @MethodSource("getAuthData")
    void testRegister(String id, String desc, String inputEmail, String inputPassword,
                      String inputFullName,
                      @ConvertWith(StringToListConverter.class) List<String> inputHeaders,
                      String expectedStatus) {
        String actualStatus = "";
        String actualMessage = "";
        String testStatus = "FAIL";

        Map<String, String> inputs = new LinkedHashMap<>();
        inputs.put("Email", inputEmail);
        inputs.put("Password", inputPassword);
        inputs.put("Fullname", inputFullName);

        try {
            RegisterDto dto = new RegisterDto();
            dto.setEmail(inputEmail);
            dto.setPassword(inputPassword);
            dto.setFullName(inputFullName);

            Set<ConstraintViolation<RegisterDto>> violations = validator.validate(dto);
            if (!violations.isEmpty()) {
                actualMessage = violations.iterator().next().getMessage();
                actualStatus = "400";
                throw new AppException(ErrorCode.INVALID_INPUT);
            }

            Mockito.when(userRepository.existsByEmail(inputEmail))
                    .thenReturn(EXISTING_EMAILS_IN_DB.contains(inputEmail));

            if (EXISTING_EMAILS_IN_DB.contains(inputEmail)) {
                throw new AppException(ErrorCode.USER_EXISTS);
            }

            Role mockRole = new Role();
            mockRole.setName("USER");
            Mockito.when(roleRepository.findByName("USER"))
                    .thenReturn(Optional.of(mockRole));

            Mockito.when(passwordEncoder.encode(Mockito.anyString()))
                    .thenReturn("encoded_password");

            Mockito.when(userRepository.save(Mockito.any(User.class)))
                    .thenAnswer(invocation -> {
                        User user = invocation.getArgument(0);
                        user.setId(UUID.randomUUID().toString());
                        return user;
                    });

            Mockito.doNothing().when(emailService)
                    .sendVerificationEmail(Mockito.anyString(), Mockito.anyString());

            authService.register(dto);
            actualStatus = "201";
            actualMessage = "Đăng ký thành công";

        } catch (AppException e) {
            if (actualStatus.isEmpty()) {
                actualStatus = String.valueOf(e.getErrorCode().getHttpStatus().value());
            }
            if (actualMessage.isEmpty()) {
                actualMessage = e.getErrorCode().getMessage();
            }
        } catch (Exception e) {
            actualStatus = "500";
            actualMessage = e.getMessage();
            e.printStackTrace();
        }

        if (expectedStatus.equals(actualStatus)) {
            testStatus = "PASS";
        }

        results.add(new TestResult(id, desc, inputs, inputHeaders, expectedStatus,
                actualStatus, actualMessage, testStatus));
    }

    private Stream<Object[]> getLoginData() throws IOException {
        return ExcelHelper.getTestData("login_data.xlsx");
    }

    @ParameterizedTest(name = "{0}: {1}")
    @MethodSource("getLoginData")
    void testLogin(String id, String desc, String inputEmail, String inputPassword,
                   @ConvertWith(StringToListConverter.class) List<String> inputHeaders,
                   String expectedStatus) {
        String actualStatus = "";
        String actualMessage = "";
        String testStatus = "FAIL";

        Map<String, String> inputs = new LinkedHashMap<>();
        inputs.put("Email", inputEmail);
        inputs.put("Password", inputPassword);

        try {
            LoginDto dto = new LoginDto();
            dto.setEmail(inputEmail);
            dto.setPassword(inputPassword);

            Set<ConstraintViolation<LoginDto>> violations = validator.validate(dto);
            if (!violations.isEmpty()) {
                actualMessage = violations.iterator().next().getMessage();
                actualStatus = "400";
                throw new AppException(ErrorCode.INVALID_INPUT);
            }

            Optional<User> userOpt = userRepository.findByEmail(inputEmail);

            if (userOpt.isEmpty()) {
                throw new AppException(ErrorCode.USER_NOT_FOUND);
            }

            User mockUser = userOpt.get();

            if (!mockUser.isVerified()) {
                throw new AppException(ErrorCode.UNVERIFIED_EMAIL);
            }

            boolean passwordMatch = passwordEncoder.matches(inputPassword, mockUser.getPassword());
            if (!passwordMatch) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }

            actualStatus = "200";
            actualMessage = "Đăng nhập thành công";

        } catch (AppException e) {
            if (actualStatus.isEmpty()) {
                actualStatus = String.valueOf(e.getErrorCode().getHttpStatus().value());
            }
            if (actualMessage.isEmpty()) {
                actualMessage = e.getErrorCode().getMessage();
            }
        } catch (Exception e) {
            actualStatus = "500";
            actualMessage = e.getMessage();
            e.printStackTrace();
        }

        if (expectedStatus.equals(actualStatus)) {
            testStatus = "PASS";
        }

        loginResults.add(new TestResult(id, desc, inputs, inputHeaders, expectedStatus,
                actualStatus, actualMessage, testStatus));
    }

    @InjectMocks private SearchService searchService;

    private Stream<Object[]> getSearchData() throws IOException {
        return ExcelHelper.getTestData("search_data.xlsx");
    }

    @ParameterizedTest(name = "{0}: {1}")
    @MethodSource("getSearchData")
    void testSearch(String id, String desc, String query, String expectedType,
                    String expectedStatus) { // BỎ inputHeaders
        String actualStatus = "";
        String actualMessage = "";
        String testStatus = "FAIL";

        // Tạo inputHeaders cố định ngay trong method
        List<String> inputHeaders = Arrays.asList("Query", "Expected Type");

        Map<String, String> inputs = new LinkedHashMap<>();
        inputs.put("Query", query);
        inputs.put("Expected Type", expectedType);

        try {
            var response = searchService.searchSuggest(query,
                    com.kanjimaster.backend.model.entity.SearchMode.SUGGEST, 5);
            actualStatus = "200";

            String actualType = determineSearchType(response);

            if (expectedType.equals(actualType)) {
                if ("EMPTY".equals(actualType)) {
                    actualMessage = "Không tìm thấy kết quả";
                } else {
                    actualMessage = String.format("Tìm thấy %d kết quả (%d kanji, %d từ ghép)",
                            response.getTotal(),
                            response.getTotalKanji(),
                            response.getTotalCompound());
                }
                testStatus = "PASS";
            } else {
                actualMessage = String.format("Sai loại kết quả. Mong đợi: %s, Nhận được: %s",
                        expectedType, actualType);
                testStatus = "FAIL";
            }
        } catch (AppException e) {
            actualStatus = String.valueOf(e.getErrorCode().getHttpStatus().value());
            actualMessage = e.getErrorCode().getMessage();
        } catch (Exception e) {
            actualStatus = "500";
            actualMessage = e.getMessage();
            e.printStackTrace();
        }

        if (expectedStatus.equals(actualStatus) && testStatus.equals("PASS")) {
            testStatus = "PASS";
        } else {
            testStatus = "FAIL";
        }

        searchResults.add(new TestResult(id, desc, inputs, inputHeaders, expectedStatus,
                actualStatus, actualMessage, testStatus));
    }

    private String determineSearchType(com.kanjimaster.backend.model.dto.SearchSuggestResponse response) {
        if (response == null || response.getTotal() == 0) return "EMPTY";
        if (response.getTotalKanji() > 0 && response.getTotalCompound() > 0) return "MIXED";
        if (response.getTotalKanji() > 0) return "KANJI";
        if (response.getTotalCompound() > 0) return "COMPOUND";
        return "EMPTY";
    }

    @AfterAll
    void tearDown() {
        ExcelHelper.writeReport("register_report.xlsx", results);
        ExcelHelper.writeReport("login_report.xlsx", loginResults);
        ExcelHelper.writeReport("search_report.xlsx", searchResults);
    }
}
