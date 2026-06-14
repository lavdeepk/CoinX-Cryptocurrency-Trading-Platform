package com.himanshu.repository;



import com.himanshu.model.User;
import org.springframework.data.jpa.repository.JpaRepository;



/**
 * Repository abstraction for UserRepository persistence operations.
 */
public interface UserRepository extends JpaRepository<User, Long> {
	
	public User findByEmail(String email);

}
