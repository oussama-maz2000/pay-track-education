package com.payTrackEdu.application.service;

import com.payTrackEdu.application.domain.AcademicYear;
import com.payTrackEdu.application.dtos.academicYear.AcademicYearRequest;
import com.payTrackEdu.application.dtos.academicYear.AcademicYearResponse;
import com.payTrackEdu.application.enums.YearStatus;
import com.payTrackEdu.application.repository.AcademicYearRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

import static com.payTrackEdu.application.utils.OwnMapper.INSTANCE_MAPPER;

@Service
@RequiredArgsConstructor
public class AcademicYearService {

    private final AcademicYearRepository academicYearRepository;

    @Transactional(readOnly = true)
    public Page<AcademicYearResponse> getAll(Pageable pageable) {
        return academicYearRepository.findAllByDeletedFalseOrderByStartDateDesc(pageable)
                .map(INSTANCE_MAPPER::toAcademicYearResponse);
    }

    @Transactional(readOnly = true)
    public AcademicYearResponse getById(UUID id) {
        return INSTANCE_MAPPER.toAcademicYearResponse(findActiveAcademicYear(id));
    }

    @Transactional
    public AcademicYearResponse create(AcademicYearRequest request) {
        validateDates(request);
        if (academicYearRepository.existsByCodeIgnoreCaseAndDeletedFalse(request.code())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Academic year code already exists");
        }

        AcademicYear academicYear = new AcademicYear();
        INSTANCE_MAPPER.fromRequestAcademicYearToEntity(request,academicYear);
        applyRequest(academicYear, request);
        return INSTANCE_MAPPER.toAcademicYearResponse(academicYearRepository.save(academicYear));
    }

    @Transactional
    public AcademicYearResponse update(UUID id, AcademicYearRequest request) {
        validateDates(request);
        AcademicYear academicYear = findActiveAcademicYear(id);
        if (academicYearRepository.existsByCodeIgnoreCaseAndDeletedFalseAndIdNot(request.code(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Academic year code already exists");
        }

        applyRequest(academicYear, request);
        return INSTANCE_MAPPER.toAcademicYearResponse(academicYearRepository.save(academicYear));
    }

    @Transactional
    public void delete(UUID id) {
        AcademicYear academicYear = findActiveAcademicYear(id);
        academicYear.setDeleted(true);
        academicYear.setDeletedAt(LocalDateTime.now());
        academicYear.setStatus(YearStatus.ARCHIVED);
        academicYearRepository.save(academicYear);
    }

    @Transactional
    public AcademicYearResponse restor(UUID id) {
        AcademicYear academicYear = academicYearRepository.findByIdAndDeletedTrue(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND, "Academic year not found"));
        academicYear.setDeleted(false);
        academicYear.setDeletedAt(null);
        academicYear.setStatus(YearStatus.ACTIVE);
        academicYearRepository.save(academicYear);
        return AcademicYearResponse.from(academicYear);
    }


    private AcademicYear findActiveAcademicYear(UUID id) {
        return academicYearRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Academic year not found"));
    }

    private void applyRequest(AcademicYear academicYear, AcademicYearRequest request) {
        academicYear.setCode(request.code().trim());
        academicYear.setStatus(request.status() == null ? YearStatus.ACTIVE : request.status());
        academicYear.setStartDate(request.startDate());
        academicYear.setEndDate(request.endDate());
    }

    private void validateDates(AcademicYearRequest request) {
        if (request.startDate() != null && request.endDate() != null && request.endDate().isBefore(request.startDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date must be on or after start date");
        }
    }
}
