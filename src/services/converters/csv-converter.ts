import { IColumn, IRow } from '@components/kit/table/interfaces/table';

export enum CsvSeparator {
  COMMA = ',',
  TAB = '\t'
}

export const convertFromCSV = (content: any, separator: CsvSeparator = CsvSeparator.COMMA) => {
  // deconstruct header from rows
  const [headerRaw, ...rowsRaw] = content.split('\r\n');

  // get header labels as array
  const headerLabels = headerRaw.split(separator) as string[];

  // build columns
  const columns: IColumn[] = headerLabels.map((label) => ({
    Header: label,
    accessor: label,
    selected: false,
    reconciliator: '',
    extension: ''
  }));

  let id = 0;

  // build rows
  const data: IRow[] = rowsRaw.map((row: string) => {
    const rowValues = row.split(separator);

    return headerLabels.reduce((acc, accessor, index) => {
      id += 1;
      return {
        ...acc,
        [accessor]: {
          id: `${id}`,
          label: rowValues[index] || '',
          metadata: []
        }
      };
    }, {});
  });

  return { columns, data };
};
