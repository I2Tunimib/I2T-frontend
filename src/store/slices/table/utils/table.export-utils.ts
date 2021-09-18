import { ID } from '@store/interfaces/store';
import { ReconciliatorsState } from '@store/slices/config/interfaces/config';
import { TableInstance } from '@store/slices/tables/interfaces/tables';
import { ColumnState, MetadataInstance, RowState } from '../interfaces/table';

export type StandardTable = StandardRow[];

interface StandardRow extends Record<string, StandardCell> { }

interface StandardCell extends Record<string, any> {
  label: string;
  context?: Context[];
  metadata?: StandardMetadata[];
}

interface Context {
  prefix: string;
  uri: string;
}

interface StandardMetadata extends Record<string, any> {
  id: ID;
  name: string;
  score?: number;
  match?: boolean;
  type?: MetaType[];
}

interface MetaType extends Record<string, any> {
  id: ID;
  name: string;
}

interface ExportTableInput {
  tableInstance: TableInstance,
  columns: ColumnState;
  rows: RowState;
  reconciliators: ReconciliatorsState;
  keepMatching: boolean;
}

const getContext = (
  reconciliatorId: ID,
  reconciliators: ReconciliatorsState
): Context[] | undefined => {
  if (reconciliatorId) {
    return [{
      prefix: reconciliators.byId[reconciliatorId].prefix,
      uri: reconciliators.byId[reconciliatorId].entityPageUrl
    }];
  }
  return undefined;
};

const getMetadata = (
  metadata: MetadataInstance[],
  keepMatching: boolean
): StandardMetadata[] | undefined => {
  let res = metadata;
  if (keepMatching) {
    res = metadata.filter((meta) => meta.match);
  }
  if (res.length > 0) {
    return res;
  }
  return undefined;
};

/**
 * Add field to object only based on condition callback.
 */
const safeAdd = (
  acc: Record<string, any>,
  object: Record<string, any>,
  condition: () => boolean = () => true
) => {
  return {
    ...acc,
    ...(condition() && { ...object })
  };
};

const convertToW3CTable = ({
  columns,
  rows,
  tableInstance,
  reconciliators,
  keepMatching
}: ExportTableInput): Promise<StandardTable> => {
  return new Promise((resolve, reject) => {
    const firstRow = columns.allIds.reduce((acc, colId, index) => {
      acc[`th${index}`] = {
        label: colId
      };
      return acc;
    }, {} as StandardRow);

    const rest = rows.allIds.map((rowId) => {
      const { cells } = rows.byId[rowId];
      return Object.keys(cells).reduce((acc, colId) => {
        const { label, metadata: { values, reconciliator: { id } } } = cells[colId];
        const metadata = getMetadata(values, keepMatching);
        const context = getContext(id, reconciliators);
        acc[colId] = safeAdd(acc[colId], { label });
        acc[colId] = safeAdd(acc[colId], { metadata }, () => !!metadata);
        acc[colId] = safeAdd(acc[colId], { context }, () => !!context && !!metadata);
        return acc;
      }, {} as StandardCell);
    });

    resolve([firstRow, ...rest]);
  });
};

export default convertToW3CTable;
