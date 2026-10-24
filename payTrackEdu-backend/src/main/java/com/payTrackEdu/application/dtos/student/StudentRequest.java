package com.payTrackEdu.application.dtos.student;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record StudentRequest(
        @NotBlank @Size(max = 150) String firstName,
        @NotBlank @Size(max = 150) String lastName,
        @NotBlank @Email @Size(max = 150) String email,
        @NotBlank @Size(max = 150) String phoneNumber1,
        @NotBlank @Size(max = 150) String phoneNumber2,
        @NotNull LocalDate birthDay,
        @NotBlank @Email @Size(max = 150) String parentEmail,
        @NotBlank @Size(max = 150) String parentPhone,
        Boolean active
) {
}
