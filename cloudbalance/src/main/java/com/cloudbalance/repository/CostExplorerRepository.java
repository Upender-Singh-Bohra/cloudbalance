package com.cloudbalance.repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

    @Repository
    public class CostExplorerRepository {
        private final JdbcTemplate snowflakeJdbcTemplate;
        private final Logger log = LoggerFactory.getLogger(CostExplorerRepository.class);

        @Autowired
        public CostExplorerRepository(@Qualifier("snowflakeJdbcTemplate") JdbcTemplate snowflakeJdbcTemplate) {
            this.snowflakeJdbcTemplate = snowflakeJdbcTemplate;
        }

        public List<Map<String, Object>> getCostData(String sql) {
            try {
                log.debug("Executing SQL cost data query: {}", sql);
                return snowflakeJdbcTemplate.queryForList(sql);
            } catch (Exception e) {
                log.error("Error executing cost data query: {}", e.getMessage(), e);
                log.error("SQL was: {}", sql);
                e.printStackTrace();
                return new ArrayList<>();
            }
        }

    public List<String> getDistinctValuesForField(String field) {
//        String sql = "SELECT DISTINCT " + field + " FROM aws.cost.cost_data ORDER BY " + field + " LIMIT 1000";
        String sql = "SELECT DISTINCT " + field + " FROM cost_explorer ORDER BY " + field + " LIMIT 1000";
//        return jdbcTemplate.queryForList(sql, String.class);
        return snowflakeJdbcTemplate.queryForList(sql, String.class);
    }

    public List<String> getAllAccountIds() {
//        String sql = "SELECT DISTINCT LINKEDACCOUNTID FROM aws.cost.cost_data ORDER BY LINKEDACCOUNTID";
        String sql = "SELECT DISTINCT LINKEDACCOUNTID FROM cost_explorer ORDER BY LINKEDACCOUNTID";
        return snowflakeJdbcTemplate.queryForList(sql, String.class);

    }

}