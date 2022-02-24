import { KG_INFO } from '@services/utils/kg-info';
import { isEmptyObject } from '@services/utils/objects-utils';
import { Draft } from 'immer';
import { BaseMetadata, Cell, ColumnMetadata, TableState } from '../interfaces/table';
import { ExtendedColumnCell } from '../table.thunk';
import { createContext, getCellContext, incrementContextReconciliated, incrementContextTotal } from './table.reconciliation-utils';
import { getColumn, getIdsFromCell } from './table.utils';

export const getAnnotationMeta = (metadata: BaseMetadata[] | undefined | null) => {
  if (!metadata || metadata.length === 0) {
    return {} as any;
  }

  const [firstItem, ...rest] = metadata;

  // eslint-disable-next-line prefer-destructuring
  let match = {
    value: firstItem.match,
    ...(firstItem.match && {
      reason: 'reconciliator'
    })
  } as any;
  let min = firstItem.score;
  let max = firstItem.score;

  rest.forEach((metaItem) => {
    if (metaItem.match) {
      match = {
        value: true,
        reason: 'reconciliator'
      };
    }
    min = metaItem.score < min ? metaItem.score : min;
    max = metaItem.score > max ? metaItem.score : max;
  });

  return {
    annotationMeta: {
      annotated: true,
      match,
      lowestScore: min,
      highestScore: max
    }
  };
};

export const getColumnAnnotationMeta = (metadata: ColumnMetadata[] | undefined | null) => {
  if (!metadata || metadata.length === 0) {
    return {} as any;
  }

  return getAnnotationMeta(metadata[0].entity);
};

export const getMetadata = (metadata: BaseMetadata[]): any => {
  if (metadata.length === 0) {
    return metadata;
  }
  return metadata.map(({ id, name, ...rest }) => {
    const [prefix, resourceId] = id.split(':');
    return {
      id,
      name: {
        value: name,
        uri: `${KG_INFO[prefix as keyof typeof KG_INFO].uri}${resourceId}`
      },
      ...rest
    };
  });
};

export const getColumnMetadata = (metadata: ColumnMetadata[]): any => {
  if (metadata.length === 0) {
    return metadata;
  }

  return metadata.map((columnMetaItem) => {
    if (!columnMetaItem.entity || columnMetaItem.entity.length === 0) {
      return columnMetaItem;
    }
    return {
      ...columnMetaItem,
      entity: getMetadata(columnMetaItem.entity)
    };
  });
};

export const createCell = (rowId: string, colId: string, newCell: ExtendedColumnCell | null) => {
  if (newCell) {
    return {
      id: `${rowId}$${colId}`,
      label: newCell.label,
      metadata: getMetadata(newCell.metadata),
      ...getAnnotationMeta(newCell.metadata)
    };
  }

  return {
    id: `${rowId}$${colId}`,
    label: 'null',
    metadata: []
  } as any;
};

export const updateContext = (state: Draft<TableState>, cell: Cell) => {
  const [rowId, colId] = getIdsFromCell(cell.id);
  const column = getColumn(state, colId);

  const contextPrefix = getCellContext(cell);

  if (contextPrefix) {
    const { uri } = KG_INFO[contextPrefix as keyof typeof KG_INFO];

    if (!column.context[contextPrefix] || isEmptyObject(column.context[contextPrefix])) {
      // create context if doesn't exist
      column.context[contextPrefix] = createContext({ uri, total: 1 });
    } else {
      column.context[contextPrefix] = incrementContextTotal(column.context[contextPrefix]);
    }

    if (cell.annotationMeta.match.value) {
      column.context[contextPrefix] = incrementContextReconciliated(column.context[contextPrefix]);
    }
  }
};
