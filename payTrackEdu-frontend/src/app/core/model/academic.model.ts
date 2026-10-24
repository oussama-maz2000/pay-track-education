export type AcademicYearRequest = {
  code: string;
  status: AcademicYearStatus;
  startDate: string;
  endDate: string;
};

export type AcademicYearResponse = {
  id: string;
  code: string;
  status: AcademicYearStatus;
  startDate: Date;
  endDate: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AcademicYearPage = {
  content: AcademicYearResponse[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export enum AcademicYearStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export function normalizeAcademicYearStatus(
  value: unknown,
): AcademicYearStatus {
  const normalized = String(value).trim().toUpperCase();

  return Object.values(AcademicYearStatus).includes(
    normalized as AcademicYearStatus,
  )
    ? (normalized as AcademicYearStatus)
    : (value as AcademicYearStatus);
}
