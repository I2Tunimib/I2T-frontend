import { Draft } from "@reduxjs/toolkit";
import { ID } from "@store/interfaces/store";
import { BaseMetadata, Cell, TableState } from "../interfaces/table";

/**
 * Remove a property from an object, without mutating it.
 */
export const removeObject = <T, K extends keyof T>(
  object: T,
  property: K,
): Omit<T, K> => {
  const { [property]: omit, ...rest } = object;
  return rest;
};

/**
 * Add the id when it is missing, remove it when it is there.
 */
export const toggleObject = <T>(oldObject: Record<ID, T>, id: ID, value: T) =>
  id in oldObject
    ? removeObject(oldObject, id)
    : { ...oldObject, [id]: value };

/**
 * Get rowId and colId from cellId.
 */
export const getIdsFromCell = (cellId: ID) => cellId.split("$") as [ID, ID];

/**
 * The prefix of a metadata id, e.g. "wd" for "wd:Q220".
 */
export const getContextPrefix = (metadata: BaseMetadata) =>
  metadata.id ? metadata.id.split(":")[0] : "";

/**
 * An id without its prefix: "wd:Q220" -> "Q220".
 */
export const stripPrefix = (id: string) =>
  id.includes(":") ? id.split(":")[1] : id;

export const getColumn = (state: Draft<TableState>, colId: ID) =>
  state.entities.columns.byId[colId];

export const getCell = (
  state: Draft<TableState>,
  rowId: ID,
  colId: ID,
): Cell => state.entities.rows.byId[rowId].cells[colId];

/**
 * Put the ids of the columns in the saved order. Columns missing from the
 * saved order go last, and saved ids of columns that do not exist are ignored.
 */
export const orderColumnIds = (columnIds: string[], columnOrder?: unknown) =>
  Array.isArray(columnOrder)
    ? [
        ...columnOrder.filter((id) => columnIds.includes(id)),
        ...columnIds.filter((id) => !columnOrder.includes(id)),
      ]
    : columnIds;

/**
 * Find a cell that may not exist.
 */
export const findCell = (
  state: Draft<TableState>,
  rowId: ID,
  colId: ID,
): Cell | undefined => state.entities.rows.byId[rowId]?.cells[colId];
