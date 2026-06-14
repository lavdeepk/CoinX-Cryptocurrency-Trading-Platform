package com.himanshu.repository;

import com.himanshu.model.ChatMessage;
import com.himanshu.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    Page<ChatMessage> findByUser(User user, Pageable pageable);

    void deleteByUser(User user);
}
