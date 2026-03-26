/** Raw row from PapaParse before validation */
export interface RawCsvRow {
  readonly [header: string]: string | undefined;
}

/** Result of column mapping detection */
export interface ColumnMapping {
  readonly dateColumn: string;
  readonly amountColumn: string;
  readonly descriptionColumn: string;
  readonly creditColumn?: string;
  readonly debitColumn?: string;
}
