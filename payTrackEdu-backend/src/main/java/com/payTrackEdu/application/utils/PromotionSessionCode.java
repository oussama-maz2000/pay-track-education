package com.payTrackEdu.application.utils;

public final class PromotionSessionCode {

    private PromotionSessionCode() {
    }

    public static String generate(String academicYearCode, String promotionCode) {
        return "%s-%s".formatted(academicYearCode.trim(), promotionCode.trim());
    }
}
