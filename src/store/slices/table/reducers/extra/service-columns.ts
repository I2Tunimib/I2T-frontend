import { Draft } from "@reduxjs/toolkit";
import { ID } from "@store/interfaces/store";
import {
  Column,
  ColumnMetadata,
  ColumnStatus,
  ExtendedColumnCell,
  TableState,
} from "../../interfaces/table";
import {
  createCell,
  getColumnAnnotationMeta,
  getColumnMetadata,
} from "../../utils/table.extension-utils";
import { refreshColumns } from "../../utils/table.reconciliation-utils";
import { stripPrefix } from "../../utils/table.utils";

type State = Draft<TableState>;

/** A column as an extension or modification service answers it. */
export interface ServiceColumn {
  label: string;
  metadata: ColumnMetadata[];
  cells: Record<string, ExtendedColumnCell | null>;
  [key: string]: any;
}

/** What the service learned about the column it worked on. */
export interface OriginalColMeta {
  originalColName?: string;
  types?: any[];
  properties?: any[];
}

export interface ServiceColumnsData {
  columns: Record<string, ServiceColumn>;
  meta?: unknown;
  originalColMeta?: OriginalColMeta | null;
}

const WIKIDATA = "https://www.wikidata.org/wiki/";

/**
 * Add the columns a service answered, right after the column it worked on
 * (at the end if that column is unknown). Their counters and status are
 * derived from their cells.
 *
 * `keepOldCells` keeps the candidates of a cell the column already had.
 */
export const addServiceColumns = (
  draft: State,
  columns: Record<string, ServiceColumn>,
  afterColumnId: ID | undefined,
  { keepOldCells = false } = {},
) => {
  const { entities } = draft;
  const afterIndex = entities.columns.allIds.findIndex((id) => id === afterColumnId);
  const newColumnIds = Object.keys(columns);

  newColumnIds.forEach((colId, position) => {
    const { metadata, cells, label, ...rest } = columns[colId];
    entities.columns.byId[colId] = {
      id: colId,
      label,
      metadata: getColumnMetadata(metadata),
      status: ColumnStatus.EMPTY,
      context: {},
      ...getColumnAnnotationMeta(metadata),
      ...rest,
    } as Column;

    entities.rows.allIds.forEach((rowId) => {
      const row = entities.rows.byId[rowId];
      const cell = createCell(rowId, colId, cells[rowId]);
      const oldCell = row.cells[colId];
      if (keepOldCells && oldCell) {
        cell.metadata = oldCell.metadata;
        cell.annotationMeta = oldCell.annotationMeta;
      }
      if (cell.metadata.length === 0) {
        cell.annotationMeta = { annotated: false, match: { value: false } };
      }
      row.cells[colId] = cell;
    });

    if (!entities.columns.allIds.includes(colId)) {
      const index =
        afterIndex !== -1 ? afterIndex + 1 + position : entities.columns.allIds.length;
      entities.columns.allIds.splice(index, 0, colId);
    }
  });

  refreshColumns(draft, newColumnIds);
};

/**
 * Extension: record the types and properties the service found on the column
 * it extended, with links to Wikidata. Existing ones are not added twice.
 */
export const addExtensionMetadata = (draft: State, originalColMeta: OriginalColMeta) => {
  const column = draft.entities.columns.byId[originalColMeta.originalColName as ID];
  if (!column) return;

  column.context.wd ??= {
    reconciliated: 0,
    total: 0,
    uri: `${WIKIDATA}Property:`,
  };
  if (column.metadata.length === 0) {
    column.metadata.push({
      id: "None:",
      match: true,
      score: 0,
      name: { value: "", uri: "" },
      type: [],
      property: [],
    } as ColumnMetadata);
  }
  const first = column.metadata[0];

  const types = (first.type ??= []);
  (originalColMeta.types ?? []).forEach((type: any) => {
    if (!types.some((t: any) => t.id === type.id)) {
      types.push({ ...type, uri: `${WIKIDATA}${stripPrefix(type.id)}` });
    }
  });

  const properties = (first.property ??= []);
  (originalColMeta.properties ?? []).forEach((property: any) => {
    if (!properties.some((p: any) => p.id === property.id && p.obj === property.obj)) {
      properties.push({ ...property, uri: `${WIKIDATA}Property:${stripPrefix(property.id)}` });
    }
  });
};

/**
 * Modification: append the properties the service found to the column it
 * modified (a column without metadata has nowhere to keep them).
 */
export const addModificationProperties = (draft: State, originalColMeta: OriginalColMeta) => {
  const column = draft.entities.columns.byId[originalColMeta.originalColName as ID];
  const first = column?.metadata[0];
  if (!first) return;
  first.property = [...(first.property ?? []), ...(originalColMeta.properties ?? [])];
};
