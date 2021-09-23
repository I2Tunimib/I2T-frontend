import { current, Draft } from '@reduxjs/toolkit';
import { ID } from '@store/interfaces/store';
import {
  Cell,
  MetadataInstance, TableState
} from '../interfaces/table';
import { getColumn } from './table.utils';

/**
 * Set matching metadata to cell based on threshold.
 */
export const setMatchingMetadata = (
  { metadata }: Cell,
  threshold: number
) => {
  let maxIndex = { index: -1, max: -1 };
  metadata.values.forEach((item, i) => {
    if (item.score > threshold && item.score > maxIndex.max) {
      maxIndex = { index: i, max: item.score };
    }
  });
  if (maxIndex.index !== -1) {
    metadata.values[maxIndex.index].match = true;
  }
};

/**
 * Check if a column is reconciliated.
 */
// export const isColumnReconciliated = (state: Draft<TableState>, colId: ID) => {
//   const { allIds: rowIds } = state.entities.rows;
//   const { rows } = state.entities;
//   return rowIds.every((rowId) => {
//     const cell = rows.byId[rowId].cells[colId];
//     return cell.metadata.values.length > 0
//       && cell.metadata.values.some((metadataItem) => metadataItem.match);
//   // && cell.metadata.reconciliator === rows.byId[rowIds[0]].cells[colId].metadata.reconciliator;
//   });
// };

export const hasColumnMetadata = (state: Draft<TableState>, colId: ID) => {
  const { allIds: rowIds } = state.entities.rows;
  const { rows } = state.entities;
  return rowIds.some((rowId) => {
    const cell = rows.byId[rowId].cells[colId];
    return cell.metadata.values.length > 0
      && cell.metadata.reconciliator === rows.byId[rowIds[0]].cells[colId].metadata.reconciliator;
  });
};

export const isReconciliatorPresent = (
  state: Draft<TableState>, colId: ID, reconciliator: string
) => {
  const { allIds: rowIds } = state.entities.rows;
  const { rows } = state.entities;
  return rowIds.some((rowId) => {
    const cell = rows.byId[rowId].cells[colId];
    return cell.metadata.values.length > 0
      && cell.metadata.reconciliator.id === reconciliator;
  });
};

export const isColumnReconciliated = (state: Draft<TableState>, colId: string) => {
  const { reconciliators } = getColumn(state, colId);
  const totalRows = state.entities.rows.allIds.length;
  const totalReconciliated = Object.keys(reconciliators)
    .reduce((acc, key) => acc + reconciliators[key].reconciliated, 0);
  if (totalReconciliated === totalRows) {
    return true;
  }
  return false;
};

export const isColumnPartialAnnotated = (state: Draft<TableState>, colId: string) => {
  const { reconciliators } = getColumn(state, colId);
  return Object.keys(reconciliators).some((key) => reconciliators[key].total > 0);
};

export const isCellReconciliated = ({ metadata }: Cell) => {
  return metadata.values.some((item) => item.match);
};

export const decrementAllReconciliator = (
  cell: Cell,
  reconciliator: { total: number, reconciliated: number}
) => {
  if (!reconciliator) {
    return {
      total: 0,
      reconciliated: 0
    };
  }
  const { total, reconciliated } = reconciliator;
  reconciliator.total = total - 1;
  if (isCellReconciliated(cell)) {
    reconciliator.reconciliated = reconciliated - 1;
  }
  return reconciliator;
};

export const decrementReconciliated = (
  reconciliator: { total: number, reconciliated: number}
) => {
  if (!reconciliator) {
    return {
      total: 0,
      reconciliated: 0
    };
  }
  const { reconciliated } = reconciliator;
  reconciliator.reconciliated = reconciliated - 1;
  return reconciliator;
};

export const decrementTotal = (
  reconciliator: { total: number, reconciliated: number}
) => {
  if (!reconciliator) {
    return {
      total: 0,
      reconciliated: 0
    };
  }
  const { total } = reconciliator;
  reconciliator.total = total - 1;
  return reconciliator;
};

export const incrementReconciliated = (
  reconciliator: { total: number, reconciliated: number}
) => {
  if (!reconciliator) {
    reconciliator = {
      total: 0,
      reconciliated: 0
    };
  }
  const { reconciliated } = reconciliator;
  reconciliator.reconciliated = reconciliated + 1;
  return reconciliator;
};

export const incrementTotal = (
  reconciliator: { total: number, reconciliated: number}
) => {
  if (!reconciliator) {
    reconciliator = {
      total: 0,
      reconciliated: 0
    };
  }
  const { total } = reconciliator;
  reconciliator.total = total + 1;
  return reconciliator;
};

export const incrementAllReconciliator = (
  cell: Cell,
  reconciliator: { total: number, reconciliated: number}
) => {
  if (!reconciliator) {
    reconciliator = {
      total: 0,
      reconciliated: 0
    };
  }
  const { total, reconciliated } = reconciliator;
  reconciliator.total = total + 1;
  if (isCellReconciliated(cell)) {
    reconciliator.reconciliated = reconciliated + 1;
  }
  return reconciliator;
};

/** */

/**
 * Get min and max scores between metadataItems of a cell.
 */
export const getMinMaxScore = (metadataArray: MetadataInstance[]) => {
  const scores = metadataArray.map((metadataItem) => metadataItem.score);
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  return { min, max };
};
