import { ColumnState, ColumnStatus, RowState } from '@store/slices/table/interfaces/table';
import { parse } from 'papaparse';

export enum CsvSeparator {
  COMMA = ',',
  TAB = '\t',
  SEMICOLUMN = ';'
}

export const convertFromCSV = async (
  content: string | File,
  separator?: CsvSeparator
) => {
  return new Promise<{ columns: ColumnState, rows: RowState }>((resolve, reject) => {
    parse(content, {
      delimiter: separator || '',
      complete: (result) => {
        const [headerRow, ...bodyRows] = result.data as string[][];
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
        resolve({ columns, rows });
      },
      error: (err) => {
        reject(err);
      }
    });
  });

  // parse and deconstruct header from rows
  // const res = parse(content, { delimiter: separator });

  // const [headerRow, ...bodyRows] = res.data as string[][];

  // const columns = headerRow.reduce((acc, label, index) => ({
  //   byId: {
  //     ...acc.byId,
  //     [`${label}`]: {
  //       id: `${label}`,
  //       label,
  //       status: ColumnStatus.EMPTY,
  //       reconciliators: [],
  //       extension: ''
  //     }
  //   },
  //   allIds: [...acc.allIds, `${label}`]
  // }), { byId: {}, allIds: [] as string[] } as ColumnState);

  // const rows = bodyRows.reduce((allRows, rowValues, rowIndex) => ({
  //   byId: {
  //     ...allRows.byId,
  //     [`r${rowIndex}`]: {
  //       id: `r${rowIndex}`,
  //       cells: headerRow.reduce((allRowCells, label, colIndex) => ({
  //         ...allRowCells,
  //         [label]: {
  //           label: rowValues[colIndex] || '',
  //           metadata: {
  //             reconciliator: '',
  //             values: []
  //           },
  //           editable: false,
  //           expandend: false
  //         }
  //       }), {})
  //     }
  //   },
  //   allIds: [...allRows.allIds, `r${rowIndex}`]
  // }), { byId: {}, allIds: [] as string[] } as RowState);

  // return {
  //   columns,
  //   rows
  // };
};
