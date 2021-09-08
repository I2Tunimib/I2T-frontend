import { ColumnState, ColumnStatus, RowState } from '@store/slices/table/interfaces/table';
import parse from 'csv-parse/lib/sync';

export enum CsvSeparator {
  COMMA = ',',
  TAB = '\t',
  SEMICOLUMN = ';'
}

export const convertFromCSV = (content: string, separator: CsvSeparator = CsvSeparator.COMMA) => {
  // parse and deconstruct header from rows
  const [headerRow, ...bodyRows]: string[][] = parse(content, { delimiter: separator, escape: '"' });

  const columns = headerRow.reduce((acc, label, index) => ({
    byId: {
      ...acc.byId,
      [`${label}`]: {
        id: `${label}`,
        label,
        status: ColumnStatus.EMPTY,
        reconciliators: [],
        extension: ''
      }
    },
    allIds: [...acc.allIds, `${label}`]
  }), { byId: {}, allIds: [] as string[] } as ColumnState);

  const rows = bodyRows.reduce((allRows, rowValues, rowIndex) => ({
    byId: {
      ...allRows.byId,
      [`r${rowIndex}`]: {
        id: `r${rowIndex}`,
        cells: headerRow.reduce((allRowCells, label, colIndex) => ({
          ...allRowCells,
          [label]: {
            label: rowValues[colIndex] || '',
            metadata: {
              reconciliator: '',
              values: []
            },
            editable: false,
            expandend: false
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
