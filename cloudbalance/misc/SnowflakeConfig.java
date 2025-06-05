//// SnowflakeConfig.java
//package com.cloudbalance.config;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.jdbc.core.JdbcTemplate;
//import org.springframework.jdbc.datasource.DriverManagerDataSource;
//
//import javax.sql.DataSource;
//
//@Configuration
//public class SnowflakeConfig {
//
//    @Value("${snowflake.url}")
//    private String url;
//
//    @Value("${snowflake.user}")
//    private String user;
//
//    @Value("${snowflake.password}")
//    private String password;
//
//    @Bean
//    public DataSource snowflakeDataSource() {
//        DriverManagerDataSource dataSource = new DriverManagerDataSource();
//        dataSource.setDriverClassName("net.snowflake.client.jdbc.SnowflakeDriver");
//        dataSource.setUrl(url);
//        dataSource.setUsername(user);
//        dataSource.setPassword(password);
//        return dataSource;
//    }
//
//    @Bean
//    public JdbcTemplate snowflakeJdbcTemplate() {
//        return new JdbcTemplate(snowflakeDataSource());
//    }
//}

// SnowflakeConfig.java
package com.cloudbalance.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;

@Configuration
public class SnowflakeConfig {

    @Value("${snowflake.url}")
    private String url;

    @Value("${snowflake.user}")
    private String user;

    @Value("${snowflake.password}")
    private String password;

    @Bean(name = "snowflakeDataSource")  // Named bean to avoid confusion with primary datasource
    public DataSource snowflakeDataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("net.snowflake.client.jdbc.SnowflakeDriver");
        dataSource.setUrl(url);
        dataSource.setUsername(user);
        dataSource.setPassword(password);
        return dataSource;
    }

    @Bean(name = "snowflakeJdbcTemplate")  // Named bean
    public JdbcTemplate snowflakeJdbcTemplate() {
        return new JdbcTemplate(snowflakeDataSource());
    }
}