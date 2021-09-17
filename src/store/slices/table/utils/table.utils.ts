import { Draft } from '@reduxjs/toolkit';
import { convertFromCSV, CsvSeparator } from '@services/converters/csv-converter';
import { ID } from '@store/interfaces/store';

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
  if (oldObject[id]) {
    return removeObject(oldObject, id);
  }
  const newObject = { [id]: value };
  return addObject(oldObject, newObject);
};

/**
 * Get rowId and colId from cellId.
 */
export const getIdsFromCell = (cellId: ID) => cellId.split('$') as [ID, ID];

const EMPTY_TABLE = {
  columns: { byId: {}, allIds: [] },
  rows: { byId: {}, allIds: [] }
};

const loadRawTable = (
  data: string | undefined,
  format: string | undefined,
  separator: CsvSeparator = CsvSeparator.COMMA
) => {
  if (!format) {
    throw Error('No format provided');
  }
  if (!data) {
    throw Error('No data provided');
  }
  if (format === 'csv') {
    return convertFromCSV(data, separator);
  }
  throw Error('Format not supported');
};

// export const loadTable = (state: Draft<TableState>, data?: string) => {
//   const { currentTable } = state.entities;
//   if (currentTable.type === 'raw') {
//     const tableData = currentTable.content || data;
//     try {
//       return loadRawTable(tableData, currentTable.format);
//     } catch (err) {
//       return EMPTY_TABLE;
//     }
//   }
//   return EMPTY_TABLE;
// };
