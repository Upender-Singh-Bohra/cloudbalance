package com.cloudbalance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaAuditing
@EnableJpaRepositories(basePackages = "com.cloudbalance.repository")
@EntityScan(basePackages = "com.cloudbalance.model")
public class CloudBalanceApplication {
	public static void main(String[] args) {
		SpringApplication.run(CloudBalanceApplication.class, args);
	}
}