package com.kanjimaster.backend.service;

import com.kanjimaster.backend.model.entity.CompoundWords;
import com.kanjimaster.backend.repository.CompoundWordRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TranslationService {
    CompoundWordRepository compoundWordRepository;
    RedisTemplate<String, String> redisTemplate;

    @Value("${DEEPL_API_KEY}")
    @NonFinal
    String apiKey;

    RestTemplate restTemplate = new RestTemplate();

    public String translateAndCacheIfNull(CompoundWords word) {
        String key = "compound:" + word.getId();
        // String cached = redisTemplate.opsForValue().get(key);
        // if (cached != null && !cached.isEmpty()) {
        //     return cached;
        // }

        String vi = word.getMeaning();
        if (vi == null || vi.isEmpty()) {
            vi = callDeepL(word.getWord());
            word.setMeaning(vi);
            compoundWordRepository.save(word);
        }

        // redisTemplate.opsForValue().set(key, vi, Duration.ofDays(1));
        return vi;
    }

    private String callDeepL(String text) {
        String url = "https://api-free.deepl.com/v2/translate";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set("Authorization", "DeepL-Auth-Key " + apiKey);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("text", text);
        params.add("target_lang", "VI");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

        List<Map<String, String>> translations = (List<Map<String, String>>) response.getBody().get("translations");
        return translations.get(0).get("text");
    }
}
