export type PromotionSessionResponse = {
  id: string;
  academicYearId: string;
  academicYearCode: string;
  promotionId: string;
  promotionCode: string;
  promotionName: string;
  registrationFee: number;
  code: string;
  status: PromotionSessionStatus;
  createdBy: string;
  createdAt: Date;
};

export type PromotionSessionDto = {
  id: string;
  code: string;
};

export type PromotionSessionRequest = {
  academicYearId: string;
  promotionId: string;
  registrationFee: number;
  status: PromotionSessionStatus;
};

export enum PromotionSessionStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export function normalizePromotionSessionStatus(
  value: unknown,
): PromotionSessionStatus {
  const normalized = String(value).trim().toUpperCase();

  return Object.values(PromotionSessionStatus).includes(
    normalized as PromotionSessionStatus,
  )
    ? (normalized as PromotionSessionStatus)
    : (value as PromotionSessionStatus);
}
