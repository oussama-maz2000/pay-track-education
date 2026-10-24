export type PaymentPlanDetails = {
  id: string;
  promotionSessionId: string;
  academicYearId: string;
  academicYearCode: string;
  promotionId: string;
  promotionCode: string;
  promotionName: string;
  plan: PaymentPlanType;
  code: string;
  totalAmount: number;
  createdBy: string;
  createdAt: Date;
};

export type PaymentPlan = {
  id: string;
  academicYearCode: string;
  promotionCode: string;
  promotionName: string;
  plan: PaymentPlanType;
  code: string;
  totalAmount: number;
  createdBy: string;
  createdAt: Date;
};

export type PaymentPlanForInstallment = Pick<PaymentPlan, 'id' | 'code'>;

export type PaymentPlanRequest = {
  promotionSessionId: string;
  code: string;
  plan: PaymentPlanType;
  totalAmount: number;
};

export enum PaymentPlanType {
  CASH = 'CASH',
  TRIMESTRE = 'TRIMESTRE',
  MENSUEL = 'MENSUEL',
}
