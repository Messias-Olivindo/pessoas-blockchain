/**
 * Result of a bulk import operation.
 */
export interface ImportResult {
  /** Total rows processed */
  total: number;
  /** Records created (new) */
  created: number;
  /** Records updated (existing) */
  updated: number;
  /** Records skipped (missing required fields) */
  skipped: number;
  /** Per-row errors */
  errors: Array<{ row: number; message: string }>;
}
