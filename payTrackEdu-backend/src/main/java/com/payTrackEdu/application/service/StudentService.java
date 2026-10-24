package com.payTrackEdu.application.service;

import com.payTrackEdu.application.domain.Student;
import com.payTrackEdu.application.dtos.student.StudentDto;
import com.payTrackEdu.application.dtos.student.StudentForEnrollment;
import com.payTrackEdu.application.dtos.student.StudentRequest;
import com.payTrackEdu.application.dtos.student.StudentResponse;
import com.payTrackEdu.application.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

    @Transactional(readOnly = true)
    public Page<StudentDto> getAll(String studentName, Pageable pageable) {
        String normalizedStudentName = normalizeName(studentName);
        Page<Student> students = normalizedStudentName == null
                ? studentRepository.findAllByDeletedFalse(pageable)
                : studentRepository.findAllByDeletedFalseAndNameContaining(normalizedStudentName, pageable);
        return students.map(StudentDto::from);
    }

    @Transactional(readOnly = true)
    public Page<StudentForEnrollment> fetchStudentsForEnrollment(Pageable pageable) {
        return studentRepository.findAllByDeletedFalse(pageable)
                .map(StudentForEnrollment::from)
                ;
    }

    @Transactional(readOnly = true)
    public StudentResponse getById(UUID id) {
        return StudentResponse.from(findActiveStudent(id));
    }

    @Transactional
    public StudentResponse create(StudentRequest request) {
        validateUniqueEmail(request.email(), null);

        Student student = new Student();
        applyRequest(student, request);
        return StudentResponse.from(studentRepository.save(student));
    }

    @Transactional
    public StudentResponse update(UUID id, StudentRequest request) {
        Student student = findActiveStudent(id);
        validateUniqueEmail(request.email(), id);

        applyRequest(student, request);
        return StudentResponse.from(studentRepository.save(student));
    }

    @Transactional
    public void delete(UUID id) {
        Student student = findActiveStudent(id);
        student.setDeleted(true);
        student.setDeletedAt(LocalDateTime.now());
        student.setActive(false);
        studentRepository.save(student);
    }

    @Transactional
    public StudentResponse restore(UUID id) {
        Student student = studentRepository.findByIdAndDeletedTrue(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        validateUniqueEmail(student.getEmail(), student.getId());
        student.setDeleted(false);
        student.setDeletedAt(null);
        student.setActive(true);
        return StudentResponse.from(studentRepository.save(student));
    }

    private Student findActiveStudent(UUID id) {
        return studentRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
    }

    private void applyRequest(Student student, StudentRequest request) {
        student.setFirstName(request.firstName().trim());
        student.setLastName(request.lastName().trim());
        student.setEmail(request.email().trim());
        student.setPhoneNumber_1(request.phoneNumber1().trim());
        student.setPhoneNumber_2(request.phoneNumber2().trim());
        student.setBirthDay(request.birthDay());
        student.setParentEmail(request.parentEmail().trim());
        student.setParentPhone(request.parentPhone().trim());
        student.setActive(request.active() == null || request.active());
    }

    private void validateUniqueEmail(String email, UUID ignoredId) {
        String normalizedEmail = email.trim();
        boolean emailExists = ignoredId == null
                ? studentRepository.existsByEmailIgnoreCaseAndDeletedFalse(normalizedEmail)
                : studentRepository.existsByEmailIgnoreCaseAndDeletedFalseAndIdNot(normalizedEmail, ignoredId);
        if (emailExists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Student email already exists");
        }
    }

    private String normalizeName(String studentName) {
        return studentName == null || studentName.isBlank() ? null : studentName.trim();
    }
}
