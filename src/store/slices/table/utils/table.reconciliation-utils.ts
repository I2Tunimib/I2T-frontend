import { Draft } from '@reduxjs/toolkit';
import { ID } from '@store/interfaces/store';
import {
  Cell,
  MetadataInstance, TableState
} from '../interfaces/table';

/**
 * Set matching metadata to cell based on threshold.
 */
export const setMatchingMetadata = (
  { metadata }: Cell, cellId: ID,
  threshold: number, selectedCellMetadataId: Record<ID, ID>
) => {
  let maxIndex = { index: -1, max: -1 };
  metadata.values.forEach((item, i) => {
    if (item.score > threshold && item.score > maxIndex.max) {
      maxIndex = { index: i, max: item.score };
    }
  });

  if (maxIndex.index !== -1) {
    metadata.values[maxIndex.index].match = true;
    selectedCellMetadataId[cellId] = metadata.values[maxIndex.index].id;
  }
};

/**
 * Check if a column is reconciliated.
 */
export const isColumnReconciliated = (state: Draft<TableState>, colId: ID) => {
  const { allIds: rowIds } = state.entities.rows;
  const { rows } = state.entities;
  return rowIds.every((rowId) => {
    const cell = rows.byId[rowId].cells[colId];
    return cell.metadata.values.length > 0
      && cell.metadata.values.some((metadataItem) => metadataItem.match);
    // && cell.metadata.reconciliator === rows.byId[rowIds[0]].cells[colId].metadata.reconciliator;
  });
};

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
