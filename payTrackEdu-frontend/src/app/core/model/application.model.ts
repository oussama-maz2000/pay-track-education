export interface Application {
  loading: boolean;
  error: string | null;
  success: string | null;
}

export type ResponsePage<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
