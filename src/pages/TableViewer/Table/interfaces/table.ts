import { ReactNode } from 'react';

/**
 * A column of the table
 */
export interface IColumn {
  Header: string | ReactNode; // What to render inside a header cell
  accessor: string; // id of column
  selected: boolean; // if a column is selected
  reconciliator?: string; // if a column is reconciliated
  extension?: string; // if a column is the result of an extension
  Cell?: (prop: any) => string | ReactNode; // What to render inside a cell
}

/**
 * A row of the table is any pair 'colAccessor: IBodyCell'
 */
export interface IRow extends Record<string, IBodyCell> { }

/**
 * A cell of the body of the table
 */
export interface IBodyCell {
  id: string;
  label: string;
  metadata?: Record<string, any>;
}

/**
 * Define metadata more in detail
 */
