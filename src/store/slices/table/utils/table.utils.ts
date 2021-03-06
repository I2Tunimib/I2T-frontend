import { ID } from '@store/interfaces/store';
import { store } from '@store';
import { Draft } from '@reduxjs/toolkit';
import {
  BaseMetadata, Cell,
  ColumnMetadata, TableState
} from '../interfaces/table';

/**
 * Add a property to another object given old and new object.
 */
export const addObject = <T, K>(oldObject: T, newObject: T): T => ({
  ...oldObject,
  ...newObject
});

/**
 * Remove property of an object given the property
 */
export const removeObject = <T, K extends keyof T>(object: T, property: K): Omit<T, K> => {
  const { [property]: omit, ...rest } = object;
  return rest;
};

/**
 * Toggle object by ID.
 */
export const toggleObject = <T>(oldObject: Record<ID, T>, id: ID, value: T) => {
  if (id in oldObject) {
    return removeObject(oldObject, id);
  }
  const newObject = { [id]: value };
  return addObject(oldObject, newObject);
};

/**
 * Get rowId and colId from cellId.
 */
export const getIdsFromCell = (cellId: ID) => cellId.split('$') as [ID, ID];
export const getContextPrefix = (metadata: BaseMetadata | ColumnMetadata) => metadata.id.split(':')[0];

const getTableState = () => store.getState().table;
export const getColumn = (
  state: Draft<TableState>,
  colId: ID
) => state.entities.columns.byId[colId];
export const getRow = (
  state: Draft<TableState>,
  rowId: ID
) => state.entities.rows.byId[rowId];
export const getRowCells = (
  state: Draft<TableState>,
  rowId: ID
) => getRow(state, rowId).cells;

export const getCell = (
  state: Draft<TableState>,
  rowId: ID,
  colId: ID
): Cell => {
  return getRowCells(state, rowId)[colId];
};
