import {
  ICellsState,
  IColumnCellState,
  IColumnsState,
  IRowCellState,
  IRowsState
} from '@store/table/table.slice';

export enum CsvSeparator {
  COMMA = ',',
  TAB = '\t'
}

export const convertFromCSV = (content: any, separator: CsvSeparator = CsvSeparator.COMMA) => {
  // deconstruct header from rows
  const [headerRaw, ...rowsRaw] = content.split('\r\n');

  // get header labels as array
  const headerValues = headerRaw.split(separator) as string[];
  const rowsValues = rowsRaw.map((row: string) => row.split(separator)) as string[][];

  let columns: IColumnsState = { byId: {}, allIds: [] as string[] };
  let rows: IRowsState = { byId: {}, allIds: [] as string[] };
  let cells: ICellsState = { byId: {}, allIds: [] as string[] };
  let rowCell: IRowCellState = { byId: {}, allIds: [] as string[] };
  let columnCell: IColumnCellState = { byId: {}, allIds: [] as string[] };

  headerValues.forEach((label, index) => {
    const id = `${index + 1}`;
    columns = {
      byId: {
        ...columns.byId,
        [id]: {
          id,
          label,
          reconciliator: '',
          extension: ''
        }
      },
      allIds: [...columns.allIds, id]
    };
  });

  let cellId = 0;

  rowsValues.forEach((rowValues, i) => {
    const rowId = `${i + 1}`;
    rows = {
      byId: {
        ...rows.byId,
        [rowId]: {
          id: rowId
        }
      },
      allIds: [...rows.allIds, rowId]
    };
    headerValues.forEach((label, j) => {
      const columnId = `${j + 1}`;
      cellId += 1;

      // construct cells state
      cells = {
        byId: {
          ...cells.byId,
          [`${cellId}`]: {
            id: `${cellId}`,
            columnId,
            rowId,
            label: rowValues[j],
            metadata: []
          }
        },
        allIds: [...cells.allIds, `${cellId}`]
      };
      // construct row-cell state
      // I can use the cellId, it doesn't matter.
      // It must be unique within this state
      rowCell = {
        byId: {
          ...rowCell.byId,
          [`${cellId}`]: {
            id: `${cellId}`,
            rowId,
            cellId: `${cellId}`
          }
        },
        allIds: [...rowCell.allIds, `${cellId}`]
      };
      // construct column-cell state
      columnCell = {
        byId: {
          ...columnCell.byId,
          [`${cellId}`]: {
            id: `${cellId}`,
            columnId,
            cellId: `${cellId}`
          }
        },
        allIds: [...columnCell.allIds, `${cellId}`]
      };
    });
  });

  return {
    columns,
    rows,
    cells,
    rowCell,
    columnCell
  };
};
