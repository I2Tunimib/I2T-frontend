import { current, Draft } from '@reduxjs/toolkit';
import { ID } from '@store/interfaces/store';
import {
  BaseMetadata,
  Cell,
  ColumnStatus,
  Context,
  TableState
} from '../interfaces/table';
import { getColumn, getContextPrefix } from './table.utils';

export const isColumnReconciliated = (state: Draft<TableState>, colId: string) => {
  const { context } = getColumn(state, colId);
  const totalRows = state.entities.rows.allIds.length;
  const totalReconciliated = Object.keys(context)
    .reduce((acc, key) => acc + context[key].reconciliated, 0);
  if (totalReconciliated === totalRows) {
    return true;
  }
  return false;
};

export const isColumnPartialAnnotated = (state: Draft<TableState>, colId: string) => {
  const { context } = getColumn(state, colId);
  return Object.keys(context).some((key) => context[key].total > 0);
};

export const isCellReconciliated = ({ metadata }: Cell) => {
  return metadata.some((item) => item.match);
};

export const getCellContext = (cell: Cell) => {
  if (cell.metadata.length > 0) {
    return getContextPrefix(cell.metadata[0]);
  }
  return '';
};

export const createContext = ({ uri = '', total = 0, reconciliated = 0 }: Partial<Context>) => {
  return {
    uri,
    total,
    reconciliated
  };
};

export const getColumnStatus = (state: Draft<TableState>, colId: ID) => {
  if (isColumnReconciliated(state, colId)) {
    return ColumnStatus.RECONCILIATED;
  }
  if (isColumnPartialAnnotated(state, colId)) {
    return ColumnStatus.PENDING;
  }
  return ColumnStatus.EMPTY;
};

export const decrementContextReconciliated = (
  context: Context
) => {
  const { reconciliated, ...rest } = context;
  return {
    ...rest,
    reconciliated: reconciliated - 1
  };
};

export const incrementContextReconciliated = (
  context: Context
) => {
  const { reconciliated, ...rest } = context;
  return {
    ...rest,
    reconciliated: reconciliated + 1
  };
};

export const decrementContextTotal = (
  context: Context
) => {
  const { total, ...rest } = context;
  return {
    ...rest,
    total: total - 1
  };
};

export const incrementContextTotal = (
  context: Context
) => {
  const { total, ...rest } = context;
  return {
    ...rest,
    total: total + 1
  };
};

export const incrementContextCounters = (
  context: Context,
  cell: Cell
) => {
  const { total, reconciliated, ...rest } = context;
  return {
    ...rest,
    total: total + 1,
    reconciliated: isCellReconciliated(cell) ? reconciliated + 1 : reconciliated
  };
};

export const decrementContextCounters = (
  context: Context,
  cell: Cell
) => {
  const { total, reconciliated, ...rest } = context;
  return {
    ...rest,
    total: total - 1,
    reconciliated: isCellReconciliated(cell) ? reconciliated - 1 : reconciliated
  };
};

export const updateNumberOfReconciliatedCells = (state: Draft<TableState>) => {
  const { tableInstance, columns } = state.entities;

  const reconciliated = columns.allIds.reduce((acc, columnId) => {
    acc += Object.keys(columns.byId[columnId].context).reduce((accInner, key) => {
      accInner += columns.byId[columnId].context[key].reconciliated;
      return accInner;
    }, 0);
    return acc;
  }, 0);
  tableInstance.nCellsReconciliated = reconciliated;
};

/** */

/**
 * Get min and max scores between metadataItems of a cell.
 */
export const getMinMaxScore = (metadata: BaseMetadata[]) => {
  const scores = metadata.map(({ score = 0 }) => score);
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  return { min, max };
};
