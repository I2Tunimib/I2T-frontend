import { Draft } from "@reduxjs/toolkit";
import { ID } from "@store/interfaces/store";
import {
  BaseMetadata,
  Cell,
  Column,
  ColumnStatus,
  Context,
  TableState,
} from "../interfaces/table";
import { getColumn, getContextPrefix } from "./table.utils";

export const isColumnReconciliated = (
  state: Draft<TableState>,
  colId: string,
) => {
  const { context } = getColumn(state, colId);
  const totalRows = state.entities.rows.allIds.length;
  const totalReconciliated = Object.keys(context).reduce(
    (acc, key) => acc + context[key].reconciliated,
    0,
  );
  if (totalReconciliated === totalRows) {
    return true;
  }
  return false;
};
export const isColumnFullyAnnotated = (
  state: Draft<TableState>,
  colId: string,
) => {
  // consider the column fully annotated if every row has a matched value (manual or reconciliator)
  const rowIds = state.entities.rows.allIds;
  const unmatched: string[] = [];

  rowIds.forEach((rowId) => {
    const cell: Cell | undefined =
      state.entities.rows.byId[rowId]?.cells?.[colId];
    const matched = !!(
      cell &&
      cell.annotationMeta &&
      cell.annotationMeta.match?.value
    );
    if (!matched) unmatched.push(rowId);
  });

  return unmatched.length === 0;
};
export const isColumnPartialAnnotated = (
  state: Draft<TableState>,
  colId: string,
) => {
  const { context } = getColumn(state, colId);
  return Object.keys(context).some((key) => context[key].total > 0);
};

export const isCellReconciliated = ({ metadata }: Cell) => {
  return metadata.some((item) => item.match);
};

export const getCellContext = (cell: Cell) => {
  if (cell.metadata.length > 0) {
    return getContextPrefix(cell.metadata[0]);
  }
  return "";
};

export const createContext = ({
  uri = "",
  total = 0,
  reconciliated = 0,
}: Partial<Context>) => {
  return {
    uri,
    total,
    reconciliated,
  };
};

export const getColumnStatus = (state: Draft<TableState>, colId: ID) => {
  if (
    isColumnReconciliated(state, colId) ||
    isColumnFullyAnnotated(state, colId)
  ) {
    return ColumnStatus.RECONCILIATED;
  }
  if (isColumnPartialAnnotated(state, colId)) {
    return ColumnStatus.PENDING;
  }
  return ColumnStatus.EMPTY;
};

export const decrementContextReconciliated = (context: Context) => {
  const { reconciliated, ...rest } = context;
  return {
    ...rest,
    reconciliated: reconciliated - 1,
  };
};

export const incrementContextReconciliated = (context: Context) => {
  const { reconciliated, ...rest } = context;
  return {
    ...rest,
    reconciliated: reconciliated + 1,
  };
};

export const decrementContextTotal = (context: Context) => {
  const { total, ...rest } = context;
  return {
    ...rest,
    total: total - 1,
  };
};

export const incrementContextTotal = (context: Context) => {
  const { total, ...rest } = context;
  return {
    ...rest,
    total: total + 1,
  };
};

export const incrementContextCounters = (context: Context, cell: Cell) => {
  const { total, reconciliated, ...rest } = context;
  return {
    ...rest,
    total: total + 1,
    reconciliated: isCellReconciliated(cell)
      ? reconciliated + 1
      : reconciliated,
  };
};

export const decrementContextCounters = (context: Context, cell: Cell) => {
  const { total, reconciliated, ...rest } = context;
  return {
    ...rest,
    total: total - 1,
    reconciliated: isCellReconciliated(cell)
      ? reconciliated - 1
      : reconciliated,
  };
};

export const updateNumberOfReconciliatedCells = (state: Draft<TableState>) => {
  const { tableInstance, columns, rows } = state.entities;

  const reconciliated = columns.allIds.reduce((acc, columnId) => {
    acc += Object.keys(columns.byId[columnId].context).reduce(
      (accInner, key) => {
        accInner += columns.byId[columnId].context[key].reconciliated
          ? columns.byId[columnId].context[key].reconciliated
          : 0;
        return accInner;
      },
      0,
    );
    return acc;
  }, 0);

  tableInstance.nCellsReconciliated = reconciliated;
  tableInstance.nCells = columns.allIds.length * rows.allIds.length;
};

export const computeCellAnnotationStats = (cell: Cell) => {
  if (cell.metadata.length === 0) {
    return {
      match: {
        value: false,
      },
      highestScore: 0,
      lowestScore: 0,
    };
  }

  const [firstItem, ...rest] = cell.metadata;

  // eslint-disable-next-line prefer-destructuring
  let match = {
    value: firstItem.match,
    ...(firstItem.match && {
      reason: "reconciliator",
    }),
  } as any;
  let min = firstItem.score;
  let max = firstItem.score;

  rest.forEach((metaItem) => {
    if (metaItem.match) {
      match = {
        value: true,
        reason: "reconciliator",
      };
    }
    min = metaItem.score < min ? metaItem.score : min;
    max = metaItem.score > max ? metaItem.score : max;
  });

  return {
    match,
    lowestScore: min,
    highestScore: max,
  };
};

export const computeColumnAnnotationStats = (column: Column) => {
  if (column.metadata.length === 0) {
    return {
      match: { value: false },
      highestScore: 0,
      lowestScore: 0,
    };
  }

  if (!column.metadata[0].entity || column.metadata[0].entity.length === 0) {
    return {
      match: { value: false },
      highestScore: 0,
      lowestScore: 0,
    };
  }

  const [firstItem, ...rest] = column.metadata[0].entity;
  console.log("firstItem", firstItem);
  // eslint-disable-next-line prefer-destructuring
  let match = {
    value: firstItem.match,
    ...(firstItem.match && {
      reason: "reconciliator",
    }),
  } as any;
  let min = firstItem.score;
  let max = firstItem.score;

  rest.forEach((metaItem) => {
    if (metaItem.match) {
      match = {
        value: true,
        reason: "reconciliator",
      };
    }
    min = metaItem.score < min ? metaItem.score : min;
    max = metaItem.score > max ? metaItem.score : max;
  });
  console.log("computeColumnAnnotationStats", column.id, {
    match,
    lowestScore: min,
    highestScore: max,
  });
  return {
    match,
    lowestScore: min,
    highestScore: max,
  };
};

export const updateScoreBoundaries = (state: Draft<TableState>) => {
  const { rows, columns, tableInstance } = state.entities;
  let min = 0;
  let max = 0;

  rows.allIds.forEach((rowId) => {
    columns.allIds.forEach((colId) => {
      const { annotationMeta } = rows.byId[rowId].cells[colId];
      if (annotationMeta) {
        if (annotationMeta.annotated) {
          const { lowestScore, highestScore } = annotationMeta;
          min = lowestScore < min ? lowestScore : min;
          max = highestScore > max ? highestScore : max;
        }
      }
    });
  });

  tableInstance.minMetaScore = min;
  tableInstance.maxMetaScore = max;
};

/** */

/**
 * Get min and max scores between metadataItems of a cell.
 */
export const getMinMaxScore = (metadata: BaseMetadata[]) => {
  const scores = metadata.map(({ score = 0 }) => score);
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  return { min, max };
};
