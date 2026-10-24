package com.payTrackEdu.application.domain;


import com.payTrackEdu.application.utils.Auditable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "payment_allocation")
@Getter
@Setter
@NoArgsConstructor
public class PaymentAllocation extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "enrollment_installment_id",
            nullable = false
    )
    private EnrollmentInstallment enrollmentInstallment;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

}
