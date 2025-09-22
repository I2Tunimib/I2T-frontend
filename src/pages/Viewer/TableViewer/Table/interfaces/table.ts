import { BaseMetadata } from '@store/slices/table/interfaces/table';
import { ReactNode } from 'react';
import { Column, Row } from '@tanstack/react-table';

/**
 * A column of the table
 */
export interface IColumn {
  header: string | ReactNode; // What to render inside a header cell
  accessorKey: string; // id of column
  selected: boolean; // if a column is selected
  reconciliator?: string; // if a column is reconciliated
  extension?: string; // if a column is the result of an extension
  cell?: (prop: any) => string | ReactNode; // What to render inside a cell
}

export interface TableColumn<TData = any, TValue = unknown> extends Column<TData, TValue> {
  reconciliator: string;
  extension: string;
}

export interface TableRow<TData = any> extends Row<TData> {}

export interface TableCell extends Cell {
  value: {
    rowId: string;
    label: string;
    metadata: BaseMetadata[];
    editable: boolean;
  }
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
