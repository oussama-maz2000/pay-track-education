package com.payTrackEdu.application.service;

import com.payTrackEdu.application.domain.AcademicYear;
import com.payTrackEdu.application.dtos.academicYear.AcademicYearRequest;
import com.payTrackEdu.application.dtos.academicYear.AcademicYearResponse;
import com.payTrackEdu.application.enums.YearStatus;
import com.payTrackEdu.application.exception.BadRequestException;
import com.payTrackEdu.application.exception.DuplicateResourceException;
import com.payTrackEdu.application.exception.ResourceNotFoundException;
import com.payTrackEdu.application.repository.AcademicYearRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
            throw new DuplicateResourceException("Le code de l'année universitaire existe déjà");
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
            throw new DuplicateResourceException("Le code de l'année universitaire existe déjà");
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
        AcademicYear academicYear = academicYearRepository.findByIdAndDeletedTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Année universitaire introuvable"));
        academicYear.setDeleted(false);
        academicYear.setDeletedAt(null);
        academicYear.setStatus(YearStatus.ACTIVE);
        academicYearRepository.save(academicYear);
        return AcademicYearResponse.from(academicYear);
    }


    private AcademicYear findActiveAcademicYear(UUID id) {
        return academicYearRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Année universitaire introuvable"));
    }

    private void applyRequest(AcademicYear academicYear, AcademicYearRequest request) {
        academicYear.setCode(request.code().trim());
        academicYear.setStatus(request.status() == null ? YearStatus.ACTIVE : request.status());
        academicYear.setStartDate(request.startDate());
        academicYear.setEndDate(request.endDate());
    }

    private void validateDates(AcademicYearRequest request) {
        if (request.startDate() != null && request.endDate() != null && request.endDate().isBefore(request.startDate())) {
            throw new BadRequestException("La date de fin doit être postérieure ou égale à la date de début");
        }
    }
}
