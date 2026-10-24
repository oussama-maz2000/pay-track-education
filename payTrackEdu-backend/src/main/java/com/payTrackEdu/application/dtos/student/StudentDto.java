package com.payTrackEdu.application.dtos.student;

import com.payTrackEdu.application.domain.Student;

import java.time.LocalDate;
import java.util.UUID;

public record StudentDto(
        UUID id,
        String firstName,
        String lastName,
        String phoneNumber1,
        boolean active,
        LocalDate createdAt,
        String createdBy
) {

    public static StudentDto from(Student student){
        return new StudentDto(
                student.getId(),
                student.getFirstName(),
                student.getLastName(),
                student.getPhoneNumber_1(),
                student.isActive(),
                student.getCreatedAt().toLocalDate(),
                student.getCreatedBy()
        );
    }
}
