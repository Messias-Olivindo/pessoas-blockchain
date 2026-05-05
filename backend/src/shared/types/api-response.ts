export type ErrorDetail = {
  field: string;
  message: string;
};

export type ApiError = {
  code: string;
  details: ErrorDetail[];
} | null;

export type ApiResponse = {
  status: number;
  message: string;
  success: boolean;
  data: unknown;
  error: ApiError;
  meta: Record<string, unknown>;
};
