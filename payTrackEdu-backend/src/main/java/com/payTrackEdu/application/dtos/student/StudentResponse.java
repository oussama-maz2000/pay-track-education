package com.payTrackEdu.application.dtos.student;

import com.payTrackEdu.application.domain.Student;

import java.time.LocalDate;
import java.util.UUID;

public record StudentResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String phoneNumber1,
        String phoneNumber2,
        LocalDate birthDay,
        String parentEmail,
        String parentPhone,
        boolean active,
        LocalDate createdAt,
        String createdBy
) {
    public static StudentResponse from(Student student) {
        return new StudentResponse(
                student.getId(),
                student.getFirstName(),
                student.getLastName(),
                student.getEmail(),
                student.getPhoneNumber_1(),
                student.getPhoneNumber_2(),
                student.getBirthDay(),
                student.getParentEmail(),
                student.getParentPhone(),
                student.isActive(),
                student.getCreatedAt().toLocalDate(),
                student.getCreatedBy()
        );
    }
}
