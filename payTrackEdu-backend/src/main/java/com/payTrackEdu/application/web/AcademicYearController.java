package com.payTrackEdu.application.web;

import com.payTrackEdu.application.dtos.academicYear.AcademicYearRequest;
import com.payTrackEdu.application.dtos.academicYear.AcademicYearResponse;
import com.payTrackEdu.application.service.AcademicYearService;
import com.payTrackEdu.application.utils.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/academic-years")
@RequiredArgsConstructor
public class AcademicYearController {

    private final AcademicYearService academicYearService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AcademicYearResponse>>> getAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(academicYearService.getAll(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AcademicYearResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(academicYearService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AcademicYearResponse>> create(@Valid @RequestBody AcademicYearRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Academic year created", academicYearService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AcademicYearResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody AcademicYearRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Academic year updated", academicYearService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        academicYearService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Academic year deleted", null));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<AcademicYearResponse>> restore(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Academic year deleted", academicYearService.restor(id)));
    }
}
