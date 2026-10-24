package com.payTrackEdu.application.domain;

import com.payTrackEdu.application.enums.PaymentPlanType;
import com.payTrackEdu.application.utils.Auditable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;


@Entity
@Table(name = "payment_plan",
        uniqueConstraints = @UniqueConstraint(columnNames = {"promotion_session_id", "plan"}))
@Getter
@Setter
@NoArgsConstructor
public class PaymentPlan extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_session_id", nullable = false)
    private PromotionSession promotionSession;

    @Column(nullable = false, length = 150)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentPlanType plan;



    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
