export type CursorPagination = {
  cursor?: string;
  direction?: 'next' | 'prev';
  limit?: number;
  sort?: string;
  q?: string;
};
