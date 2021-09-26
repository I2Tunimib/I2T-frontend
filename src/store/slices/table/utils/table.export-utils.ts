import { ID } from '@store/interfaces/store';
import { ReconciliatorsState } from '@store/slices/config/interfaces/config';
import { TableInstance } from '@store/slices/tables/interfaces/tables';
import { BaseMetadata, ColumnState, RowState } from '../interfaces/table';

export type StandardTable = StandardRow[];

interface StandardHeader extends Record<string, StandardColumnCell> {}

interface StandardRow extends Record<string, StandardCell> { }

interface StandardColumnCell extends Record<string, any> {
  label: string;
  context: Context[];
  kind?: string;
  role?: string;
  metadata: StandardMetadata[];
}

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
  property?: MetaType[];
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
      uri: reconciliators.byId[reconciliatorId].uri
    }];
  }
  return undefined;
};

const getMetadata = (
  metadata: BaseMetadata[],
  keepMatching: boolean
): StandardMetadata[] | undefined => {
  if (keepMatching) {
    return metadata.filter((meta) => meta.match);
  }
  return metadata;
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
      const {
        id,
        expanded,
        extension,
        status,
        context,
        ...propsToKeep
      } = columns.byId[colId];

      const standardContext = Object.keys(context).reduce((accCtx, prefix) => {
        const { uri } = context[prefix];
        return [...accCtx, { prefix: `${prefix}:`, uri }];
      }, [] as Context[]);

      acc[`th${index}`] = {
        ...propsToKeep,
        context: standardContext
      };
      return acc;
    }, {} as StandardHeader);

    const rest = rows.allIds.map((rowId) => {
      const { cells } = rows.byId[rowId];
      return Object.keys(cells).reduce((acc, colId) => {
        const {
          id,
          editable,
          expanded,
          metadata,
          ...propsToKeep
        } = cells[colId];

        acc[colId] = {
          ...propsToKeep,
          metadata: getMetadata(metadata, keepMatching)
        };
        return acc;
      }, {} as StandardCell);
    });

    resolve([firstRow, ...rest]);
  });
};

export default convertToW3CTable;
