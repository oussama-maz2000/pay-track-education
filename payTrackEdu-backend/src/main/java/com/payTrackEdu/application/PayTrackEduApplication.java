package com.payTrackEdu.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
@EnableAsync
public class PayTrackEduApplication {

	public static void main(String[] args) {
		SpringApplication.run(PayTrackEduApplication.class, args);
	}

}
