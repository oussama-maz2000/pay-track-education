package com.payTrackEdu.application.web;

import com.payTrackEdu.application.dtos.student.StudentDto;
import com.payTrackEdu.application.dtos.student.StudentForEnrollment;
import com.payTrackEdu.application.dtos.student.StudentRequest;
import com.payTrackEdu.application.dtos.student.StudentResponse;
import com.payTrackEdu.application.service.StudentService;
import com.payTrackEdu.application.utils.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<StudentDto>>> getAll(
            @RequestParam(required = false) String studentName,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getAll(studentName, pageable)));
    }

    @GetMapping("/for-enrollment")
    public ResponseEntity<ApiResponse<Page<StudentForEnrollment>>> fetchStudentsForEnrollment(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(studentService.fetchStudentsForEnrollment(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StudentResponse>> create(@Valid @RequestBody StudentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Student created", studentService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody StudentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Student updated", studentService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        studentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Student deleted", null));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentResponse>> restore(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Student restored", studentService.restore(id)));
    }
}
