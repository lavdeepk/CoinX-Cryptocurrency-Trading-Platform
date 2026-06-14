package com.himanshu.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Locale;

@Component
/**
 * Ensures chat_messages.content can store long AI responses.
 */
public class ChatMessageSchemaMigration implements CommandLineRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(ChatMessageSchemaMigration.class);

    private final JdbcTemplate jdbcTemplate;

    public ChatMessageSchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            String dataType = jdbcTemplate.query(
                    "SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS " +
                            "WHERE TABLE_SCHEMA = DATABASE() " +
                            "AND TABLE_NAME = 'chat_messages' " +
                            "AND COLUMN_NAME = 'content'",
                    resultSet -> resultSet.next() ? resultSet.getString("DATA_TYPE") : null
            );

            if (!StringUtils.hasText(dataType)) {
                return;
            }

            String normalizedType = dataType.toLowerCase(Locale.ROOT);
            if ("longtext".equals(normalizedType)) {
                return;
            }

            jdbcTemplate.execute("ALTER TABLE chat_messages MODIFY COLUMN content LONGTEXT NOT NULL");
            LOGGER.info("chat_messages.content migrated from {} to LONGTEXT", normalizedType);
        } catch (Exception exception) {
            LOGGER.warn("Could not verify/migrate chat_messages.content type", exception);
        }
    }
}
