import { PaymentPlanType } from './payment-plan.model';

export type PaymentPlanForInstallmentDetails = {
  id: string;
  paymentPlanId: string;
  paymentPlanCode: string;
  paymentPlanType: PaymentPlanType;
  promotionSessionId: string;
  academicYearId: string;
  academicYearCode: string;
  promotionId: string;
  promotionCode: string;
  promotionName: string;
  sequenceNumber: number;
  type: PaymentPlanInstallmentType;
  amount: number;
  dueDate: Date;
  createdBy: string;
  createdAt: Date;
};

export type PaymentPlanInstallmentDto = Pick<
  PaymentPlanForInstallmentDetails,
  | 'id'
  | 'academicYearId'
  | 'academicYearCode'
  | 'paymentPlanCode'
  | 'sequenceNumber'
  | 'type'
  | 'amount'
  | 'dueDate'
  | 'createdBy'
  | 'createdAt'
>;

export type PaymentPlanInstallmentRequest = Pick<
  PaymentPlanForInstallmentDetails,
  'paymentPlanId' | 'sequenceNumber' | 'type' | 'amount' | 'dueDate'
>;

export enum PaymentPlanInstallmentType {
  DEPOSIT = 'DEPOSIT',
  TUITION = 'TUITION',
}
