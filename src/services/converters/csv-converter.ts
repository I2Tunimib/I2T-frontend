import { ColumnState, RowState } from '@store/slices/table/interfaces/table';

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

  const columns = headerValues.reduce((acc, label, index) => ({
    byId: {
      ...acc.byId,
      [`${label}`]: {
        id: `${label}`,
        label,
        reconciliator: '',
        extension: ''
      }
    },
    allIds: [...acc.allIds, `${label}`]
  }), { byId: {}, allIds: [] as string[] } as ColumnState);

  const rows = rowsValues.reduce((allRows, rowValues, rowIndex) => ({
    byId: {
      ...allRows.byId,
      [`r${rowIndex}`]: {
        id: `r${rowIndex}`,
        cells: headerValues.reduce((allRowCells, label, colIndex) => ({
          ...allRowCells,
          [label]: {
            label: rowValues[colIndex],
            metadata: [],
            editable: false
          }
        }), {})
      }
    },
    allIds: [...allRows.allIds, `r${rowIndex}`]
  }), { byId: {}, allIds: [] as string[] } as RowState);

  return {
    columns,
    rows
  };
};
