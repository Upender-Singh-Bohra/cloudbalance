
package com.cloudbalance.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.jdbc.DataSourceBuilder;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String mysqlUrl;

    @Value("${spring.datasource.username}")
    private String mysqlUsername;

    @Value("${spring.datasource.password}")
    private String mysqlPassword;

    @Value("${spring.datasource.driver-class-name}")
    private String mysqlDriverClassName;

    @Primary
    @Bean(name = "dataSource")
    public DataSource primaryDataSource() {
        return DataSourceBuilder.create()
                .url(mysqlUrl)
                .username(mysqlUsername)
                .password(mysqlPassword)
                .driverClassName(mysqlDriverClassName)
                .build();
    }

@Bean(name = "snowflakeDataSource")
public DataSource snowflakeDataSource() {
    String url = "jdbc:snowflake://YFYRZGG-BWB35436.snowflakecomputing.com/?db=aws&schema=cost&warehouse=COMPUTE_WH&CLIENT_RESULT_COLUMN_CASE_INSENSITIVE=true&JDBC_QUERY_RESULT_FORMAT=JSON";

    return DataSourceBuilder.create()
            .driverClassName("net.snowflake.client.jdbc.SnowflakeDriver")
            .url(url)
            .username("ro_user")
            .password("fRe$her@b00tc@mp2025")
            .build();
}

    @Bean(name = "snowflakeJdbcTemplate")
    public JdbcTemplate snowflakeJdbcTemplate(@Qualifier("snowflakeDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}