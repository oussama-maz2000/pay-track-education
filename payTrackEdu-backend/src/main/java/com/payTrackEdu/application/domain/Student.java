package com.payTrackEdu.application.domain;


import com.payTrackEdu.application.utils.Auditable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "student")
@Getter
@Setter
@NoArgsConstructor
public class Student extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 150)
    private String firstName;

    @Column(nullable = false, length = 150)
    private String lastName;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(nullable = false, length = 150)
    private String phoneNumber_1;

    @Column(nullable = false, length = 150)
    private String phoneNumber_2;

    @Column(nullable = false)
    private LocalDate birthDay;

    @Column(nullable = false, length = 150)
    private String parentEmail;

    @Column(nullable = false, length = 150)
    private String parentPhone;

    @Column(nullable = false)
    private boolean active=true;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
