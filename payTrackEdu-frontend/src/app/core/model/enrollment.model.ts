import { PaymentPlanType } from './payment-plan.model';

export type EnrollmentDto = Pick<
  EnrollmentResponse,
  | 'id'
  | 'studentFirstName'
  | 'studentLastName'
  | 'academicYearCode'
  | 'paymentPlanCode'
  | 'registrationFeeAmount'
  | 'tuitionAmount'
  | 'discountAmount'
  | 'status'
  | 'totalAmount'
  | 'finalAmount'
  | 'paidAmount'
  | 'remainingAmount'
>;

export type EnrollmentRequest = Pick<
  EnrollmentResponse,
  | 'studentId'
  | 'promotionSessionId'
  | 'paymentPlanId'
  | 'discountAmount'
  | 'discountReason'
>;

export interface EnrollmentResponse {
  id: string;
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  promotionSessionId: string;
  academicYearId: string;
  academicYearCode: string;
  promotionId: string;
  promotionCode: string;
  promotionName: string;
  paymentPlanId: string;
  paymentPlanCode: string;
  paymentPlanType: PaymentPlanType;
  registrationFeeAmount: number;
  tuitionAmount: number;
  discountAmount: number;
  discountReason: string;
  status: EnrollmentStatus;
  totalAmount: number;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  createdAt: Date;
  createdBy: string;
}

export enum EnrollmentStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  SUSPENDED = 'SUSPENDED',
}
