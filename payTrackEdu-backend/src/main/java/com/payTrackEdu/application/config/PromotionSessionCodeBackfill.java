package com.payTrackEdu.application.config;

import com.payTrackEdu.application.repository.PromotionSessionRepository;
import com.payTrackEdu.application.utils.PromotionSessionCode;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class PromotionSessionCodeBackfill {

    private final PromotionSessionRepository promotionSessionRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void populateMissingCodes() {
        promotionSessionRepository.findAllWithoutCodeWithDetails().forEach(session ->
                session.setCode(PromotionSessionCode.generate(
                        session.getAcademicYear().getCode(),
                        session.getPromotion().getCode()
                ))
        );
    }
}
