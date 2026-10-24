package com.payTrackEdu.application.service;

import com.payTrackEdu.application.domain.Promotion;
import com.payTrackEdu.application.dtos.promotion.PromotionRequest;
import com.payTrackEdu.application.dtos.promotion.PromotionResponse;
import com.payTrackEdu.application.repository.PromotionRepository;
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
public class PromotionService {

    private final PromotionRepository promotionRepository;

    @Transactional(readOnly = true)
    public Page<PromotionResponse> getAll(Pageable pageable) {
        return promotionRepository.findAllByDeletedFalseOrderByNameAsc(pageable)
                .map(PromotionResponse::from)
                ;
    }

    @Transactional(readOnly = true)
    public PromotionResponse getById(UUID id) {
        return PromotionResponse.from(findActivePromotion(id));
    }

    @Transactional
    public PromotionResponse create(PromotionRequest request) {
        validateUniqueFields(request.code(), request.name(), null);

        Promotion promotion = new Promotion();
        applyRequest(promotion, request);
        return PromotionResponse.from(promotionRepository.save(promotion));
    }

    @Transactional
    public PromotionResponse update(UUID id, PromotionRequest request) {
        Promotion promotion = findActivePromotion(id);
        validateUniqueFields(request.code(), request.name(), id);

        applyRequest(promotion, request);
        return PromotionResponse.from(promotionRepository.save(promotion));
    }

    @Transactional
    public void delete(UUID id) {
        Promotion promotion = findActivePromotion(id);
        promotion.setDeleted(true);
        promotion.setDeletedAt(LocalDateTime.now());
        promotion.setActive(false);
        promotionRepository.save(promotion);
    }

    @Transactional
    public PromotionResponse restore(UUID id) {
        Promotion promotion = promotionRepository.findByIdAndDeletedTrue(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Promotion not found"));
        promotion.setDeleted(false);
        promotion.setDeletedAt(null);
        promotion.setActive(true);
        return PromotionResponse.from(promotionRepository.save(promotion));
    }

    private Promotion findActivePromotion(UUID id) {
        return promotionRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Promotion not found"));
    }

    private void applyRequest(Promotion promotion, PromotionRequest request) {
        promotion.setCode(request.code().trim());
        promotion.setName(request.name().trim());
        promotion.setActive(request.active() == null || request.active());
    }

    private void validateUniqueFields(String code, String name, UUID ignoredId) {
        String normalizedCode = code.trim();
        String normalizedName = name.trim();

        boolean codeExists = ignoredId == null
                ? promotionRepository.existsByCodeIgnoreCaseAndDeletedFalse(normalizedCode)
                : promotionRepository.existsByCodeIgnoreCaseAndDeletedFalseAndIdNot(normalizedCode, ignoredId);
        if (codeExists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Promotion code already exists");
        }

        boolean nameExists = ignoredId == null
                ? promotionRepository.existsByNameIgnoreCaseAndDeletedFalse(normalizedName)
                : promotionRepository.existsByNameIgnoreCaseAndDeletedFalseAndIdNot(normalizedName, ignoredId);
        if (nameExists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Promotion name already exists");
        }
    }
}
