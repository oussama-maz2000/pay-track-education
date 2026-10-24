package com.payTrackEdu.application.service;

import com.payTrackEdu.application.domain.AcademicYear;
import com.payTrackEdu.application.domain.Promotion;
import com.payTrackEdu.application.domain.PromotionSession;
import com.payTrackEdu.application.dtos.promotionSession.PromotionSessionDto;
import com.payTrackEdu.application.dtos.promotionSession.PromotionSessionRequest;
import com.payTrackEdu.application.dtos.promotionSession.PromotionSessionResponse;
import com.payTrackEdu.application.enums.PromotionSessionStatus;
import com.payTrackEdu.application.repository.AcademicYearRepository;
import com.payTrackEdu.application.repository.PromotionRepository;
import com.payTrackEdu.application.repository.PromotionSessionRepository;
import com.payTrackEdu.application.utils.PromotionSessionCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PromotionSessionService {

    private final PromotionSessionRepository promotionSessionRepository;
    private final AcademicYearRepository academicYearRepository;
    private final PromotionRepository promotionRepository;

    @Transactional(readOnly = true)
    public Page<PromotionSessionResponse> getAll(Pageable pageable) {
        return promotionSessionRepository.findAllWithDetails(pageable)
                .map(PromotionSessionResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<PromotionSessionDto> getPaymentPlanOptions(Pageable pageable) {
        return promotionSessionRepository.findAllWithDetails(pageable)
                .map(PromotionSessionDto::from);
    }

    @Transactional(readOnly = true)
    public PromotionSessionResponse getById(UUID id) {
        return PromotionSessionResponse.from(findActivePromotionSession(id));
    }

    @Transactional
    public PromotionSessionResponse create(PromotionSessionRequest request) {
        validateUniqueSession(request.academicYearId(), request.promotionId(), null);

        PromotionSession promotionSession = new PromotionSession();
        applyRequest(promotionSession, request);
        return PromotionSessionResponse.from(promotionSessionRepository.save(promotionSession));
    }

    @Transactional
    public PromotionSessionResponse update(UUID id, PromotionSessionRequest request) {
        PromotionSession promotionSession = findActivePromotionSession(id);
        validateUniqueSession(request.academicYearId(), request.promotionId(), id);

        applyRequest(promotionSession, request);
        return PromotionSessionResponse.from(promotionSessionRepository.save(promotionSession));
    }

    @Transactional
    public void delete(UUID id) {
        PromotionSession promotionSession = findActivePromotionSession(id);
        promotionSession.setDeleted(true);
        promotionSession.setDeletedAt(LocalDateTime.now());
        promotionSession.setStatus(PromotionSessionStatus.ARCHIVED);
        promotionSessionRepository.save(promotionSession);
    }

    @Transactional
    public PromotionSessionResponse restore(UUID id) {
        PromotionSession promotionSession = promotionSessionRepository.findByIdAndDeletedTrue(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Promotion session not found"));
        promotionSession.setDeleted(false);
        promotionSession.setDeletedAt(null);
        promotionSession.setStatus(PromotionSessionStatus.OPEN);
        return PromotionSessionResponse.from(promotionSessionRepository.save(promotionSession));
    }

    private PromotionSession findActivePromotionSession(UUID id) {
        return promotionSessionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Promotion session not found"));
    }

    private void applyRequest(PromotionSession promotionSession, PromotionSessionRequest request) {
        AcademicYear academicYear = academicYearRepository.findByIdAndDeletedFalse(request.academicYearId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Academic year not found"));
        Promotion promotion = promotionRepository.findByIdAndDeletedFalse(request.promotionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Promotion not found"));

        promotionSession.setAcademicYear(academicYear);
        promotionSession.setPromotion(promotion);
        promotionSession.setCode(PromotionSessionCode.generate(academicYear.getCode(), promotion.getCode()));
        promotionSession.setRegistrationFee(request.registrationFee());
        promotionSession.setStatus(request.status() == null ? PromotionSessionStatus.OPEN : request.status());
    }

    private void validateUniqueSession(UUID academicYearId, UUID promotionId, UUID ignoredId) {
        boolean sessionExists = ignoredId == null
                ? promotionSessionRepository.existsActiveSession(academicYearId, promotionId)
                : promotionSessionRepository.existsActiveSessionForAnotherId(academicYearId, promotionId, ignoredId);
        if (sessionExists) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Promotion session already exists for this academic year and promotion"
            );
        }
    }
}
