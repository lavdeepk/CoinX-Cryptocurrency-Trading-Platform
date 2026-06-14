package com.himanshu.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.himanshu.model.enums.USER_ROLE;
import com.himanshu.model.enums.UserStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
/**
 * Domain model representing User.
 */
public class User {
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	private String fullName;
	private String email;
	private String mobile;

	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private String password;
	
	private UserStatus status= UserStatus.PENDING;

	private boolean isVerified = false;

	@Embedded
	private TwoFactorAuth twoFactorAuth= new TwoFactorAuth();

	private String picture;

	private USER_ROLE role= USER_ROLE.ROLE_USER;

}
