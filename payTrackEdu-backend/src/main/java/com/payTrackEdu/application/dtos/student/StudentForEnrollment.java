package com.payTrackEdu.application.dtos.student;

import com.payTrackEdu.application.domain.Student;

import java.util.UUID;

public record StudentForEnrollment(
        UUID id,
        String firstName,
        String lastName
) {
    public static StudentForEnrollment from(Student student){
        return new StudentForEnrollment(
                student.getId(),
                student.getFirstName(),
                student.getLastName()

        );
    }
}
