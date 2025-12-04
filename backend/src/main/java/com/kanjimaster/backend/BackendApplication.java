package com.kanjimaster.backend;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import java.util.TimeZone;

@EnableAsync
@SpringBootApplication
public class BackendApplication {

    @PostConstruct
    void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    }
	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
