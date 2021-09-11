import {
  ColumnState, ColumnStatus,
  ID,
  RowState,
  TableFile, TableType
} from '@store/slices/table/interfaces/table';
import { parse } from 'papaparse';

/**
 * Parse all files in a promise.
 */
const parseFiles = async (files: TableFile[]): Promise<Record<TableType, string[][]>> => {
  const resolvedPromises: any[] = await Promise.all([...files].map(({ original: file, type }) => (
    new Promise((resolve, reject) => (
      parse(file || '', {
        complete: (result) => {
          resolve({
            [type]: result.data
          });
        },
        error: reject
      })
    ))
  )));
  return resolvedPromises.reduce((acc, resolved) => ({
    ...acc,
    ...resolved
  }), {});
};

const getAnnotationId = (annotationRow: string[]) => {
  return annotationRow[annotationRow.length - 1].split('/').reverse()[0];
};

const getAnnotation = (annotations: string[][], rowIndex: number, colIndex: number) => {
  return annotations.find((row) => row[1] === `${rowIndex}` && row[2] === `${colIndex}`);
};

const getColumnStatus = (rows: RowState, colId: ID) => {
  let status = ColumnStatus.EMPTY;
  const reconciliators: string[] = [];
  let allReconciliated = true;

  rows.allIds.forEach((rowId) => {
    const cell = rows.byId[rowId].cells[colId];
    if (cell.metadata.values.length > 0) {
      reconciliators.push(cell.metadata.reconciliator);
      status = ColumnStatus.PENDING;
    } else {
      allReconciliated = false;
    }
  });
  status = allReconciliated ? ColumnStatus.RECONCILIATED : status;
  return { status, reconciliators: [...new Set(reconciliators)] };
};

export const convertFromChallengeTables = async (
  files: TableFile[]
) => {
  const dataTable = files.find((file) => file.type === TableType.DATA);
  if (!dataTable) {
    throw Error('Cannot load challenge table without data table');
  }
  // get original name (user could have modified name from form)
  let originalName = '';
  if (dataTable.original && typeof dataTable.original !== 'string') {
    const splittedName = dataTable.original.name.split('.');
    originalName = splittedName.slice(0, splittedName.length - 1).join('');
  }
  // parse all files
  const parsedFiles = await parseFiles(files);
  // find annotations for the table
  const filteredAnnotations = parsedFiles.cea.filter((row) => row[0] === originalName);

  // build columns
  const [headerRow, ...bodyRows] = parsedFiles.data;
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

  // necessary for UI
  const selectedCellMetadataId = {} as Record<ID, ID>;

  // build rows
  const rows = bodyRows.reduce((allRows, rowValues, rowIndex) => ({
    byId: {
      ...allRows.byId,
      [`r${rowIndex}`]: {
        id: `r${rowIndex}`,
        cells: headerRow.reduce((allRowCells, label, colIndex) => {
          const annotation = getAnnotation(filteredAnnotations, rowIndex + 1, colIndex);
          if (annotation) {
            selectedCellMetadataId[`r${rowIndex}$${label}`] = getAnnotationId(annotation);
          }
          return {
            ...allRowCells,
            [label]: {
              label: rowValues[colIndex] || '',
              metadata: {
                reconciliator: annotation ? 'Wikidata' : '',
                values: annotation ? [{
                  id: getAnnotationId(annotation),
                  name: getAnnotationId(annotation),
                  match: true,
                  score: 100
                }] : []
              },
              editable: false,
              expandend: false
            }
          };
        }, {})
      }
    },
    allIds: [...allRows.allIds, `r${rowIndex}`]
  }), { byId: {}, allIds: [] as string[] } as RowState);

  // get column status after setting metadata
  columns.byId = columns.allIds.reduce((acc, colId) => {
    const { status, reconciliators } = getColumnStatus(rows, colId);
    return {
      ...acc,
      [colId]: {
        ...columns.byId[colId],
        status,
        reconciliators
      }
    };
  }, {});

  return { columns, rows, selectedCellMetadataId };
};
