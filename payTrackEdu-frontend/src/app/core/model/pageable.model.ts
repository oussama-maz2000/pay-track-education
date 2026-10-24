/** Metadata returned by paginated backend list endpoints. */
export type Pageable = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
