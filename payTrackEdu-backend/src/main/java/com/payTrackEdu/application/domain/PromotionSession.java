package com.payTrackEdu.application.domain;


import com.payTrackEdu.application.enums.PromotionSessionStatus;
import com.payTrackEdu.application.utils.Auditable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "promotion_session",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"academic_year_id", "promotion_id"}),
                @UniqueConstraint(columnNames = {"code"})
        }
)
@Getter
@Setter
@NoArgsConstructor
public class PromotionSession extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id", nullable = false)
    private Promotion promotion;

    // Nullable only during the automatic backfill of sessions created before this field existed.
    @Column(length = 310)
    private String code;

    @Column(name = "registration_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal registrationFee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PromotionSessionStatus status = PromotionSessionStatus.OPEN;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
