export type StudentDetails = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber1: string;
  phoneNumber2: string;
  birthDay: Date;
  parentEmail: string;
  parentPhone: string;
  active: boolean;
  createdAt: Date;
  createdBy: string;
};

export type StudentDto = Pick<
  StudentDetails,
  | 'id'
  | 'firstName'
  | 'lastName'
  | 'phoneNumber1'
  | 'active'
  | 'createdAt'
  | 'createdBy'
>;

export type StudentForEnrollment = Pick<
  StudentDetails,
  'id' | 'firstName' | 'lastName'
>;

export type StudentRequest = Omit<
  StudentDetails,
  'id' | 'createdAt' | 'createdBy'
>;
