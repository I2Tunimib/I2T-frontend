import { ColumnState, RowState, ID } from '../interfaces/table';
import { removeObject } from './table.utils';

export const deleteOneColumn = (columns: ColumnState, rows: RowState, id: ID) => {
  const newColumns: ColumnState = {
    byId: removeObject(columns.byId, id),
    allIds: columns.allIds.filter((colId) => colId !== id)
  };
  const newRows: RowState = {
    byId: rows.allIds.reduce((acc, rowId) => {
      return {
        ...acc,
        [rowId]: {
          ...rows.byId[rowId],
          cells: removeObject(rows.byId[rowId].cells, id)
        }
      };
    }, {}),
    allIds: [...rows.allIds]
  };
  return { newColumns, newRows };
};
