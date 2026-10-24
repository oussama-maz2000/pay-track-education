export type EnrollmentInstallmentDetails = {
  id: string;
  enrollmentId: string;
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  paymentPlanId: string;
  paymentPlanCode: string;
  sequenceNumber: number;
  type: EnrollmentInstallmentType;
  label: string;
  expectedAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: Date;
  status: InstallmentStatus;
  createdAt: Date;
  createdBy: string;
};

export type EnrollementInstallmentDto = Pick<
  EnrollmentInstallmentDetails,
  | 'id'
  | 'sequenceNumber'
  | 'type'
  | 'label'
  | 'expectedAmount'
  | 'paidAmount'
  | 'remainingAmount'
  | 'dueDate'
  | 'status'
>;

export enum EnrollmentInstallmentType {
  REGISTRATION = 'REGISTRATION',
  DEPOSIT = 'DEPOSIT',
  TUITION = 'TUITION',
}

export type UpdateEnrollmentInstallmentDueDateRequest = {
  dueDate: Date;
};

export enum InstallmentStatus {
  PENDING = 'PENDING',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}
