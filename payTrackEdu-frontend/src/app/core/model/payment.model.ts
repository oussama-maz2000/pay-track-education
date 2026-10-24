export type PaymentResponse = {
  id: string;
  enrollmentId: string;
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  promotionCode: string;
  academicYearCode: string;
  receiptNumber: string;
  paymentDate: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  reference: string;
  notes: string;
  status: PaymentStatus;
  createdAt: Date;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  createdBy: string;
};

export type PaymentDto = Pick<
  PaymentResponse,
  | 'id'
  | 'receiptNumber'
  | 'paymentDate'
  | 'amount'
  | 'paymentMethod'
  | 'reference'
  | 'createdAt'
>;
export type CreatePaymentDto = Pick<
  PaymentResponse,
  | 'enrollmentId'
  | 'paymentDate'
  | 'amount'
  | 'paymentMethod'
  | 'reference'
  | 'notes'
>;
export type CancelPaymentDto = Pick<PaymentResponse, 'cancellationReason'>;

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  OTHER = 'OTHER',
}

export enum PaymentStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
}
