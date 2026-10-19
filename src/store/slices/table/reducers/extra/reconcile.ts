import { getColumnTypeStats } from "../../utils/table.metadata-utils";
import { stripPrefix } from "../../utils/table.utils";
import { Draft, PayloadAction } from "@reduxjs/toolkit";
import { ID, Payload } from "@store/interfaces/store";
import {
  ReconciliationFulfilledPayload,
  TableState,
} from "../../interfaces/table";
import { TableReducer } from "../types";
import { withHistory } from "../history";
import {
  getCell,
  getColumn,
  findCell,
  getIdsFromCell,
} from "../../utils/table.utils";
import {
  getCellContext,
  isCellReconciliated,
  computeCellAnnotationStats,
  computeColumnAnnotationStats,
  createContext,
  refreshTableCounts,
  refreshScoreBoundaries,
  getColumnStatus,
} from "../../utils/table.reconciliation-utils";
import { resolveURI } from "@services/utils/uri-utils";

type State = Draft<TableState>;

export const reconcileFulfilled: TableReducer<
  Payload<ReconciliationFulfilledPayload>
> = (
  state,
  { payload: { data, reconciliator, undoable = true, operationLog } },
) => {
  // If it is an in-table linker, the results name the effective reconciliator.
  const effectiveReconciliator =
    (data as any)?.reconciliator && reconciliator.id === "inTableLinker"
      ? (data as any).reconciliator
      : reconciliator;
  const { id: reconcilerId, prefix, uri } = effectiveReconciliator;

  return withHistory(
    state,
    undoable,
    (draft) => {
      const rawArray = Array.isArray(data) ? data : Object.values(data);
      const dataArray = rawArray.filter(
        (item): item is { id: string; metadata: any[]; annotations?: any } =>
          item != null,
      );

      const colIds = new Set<ID>();
      dataArray.forEach(({ id }) => {
        if (id.includes("$")) {
          colIds.add(getIdsFromCell(id)[1]);
        } else {
          colIds.add(id as ID);
        }
      });

      // Reset the reconciliation of every touched column.
      colIds.forEach((colId) => {
        const column = getColumn(draft, colId);
        if (column) {
          column.reconciler = reconcilerId;
          column.context = {};
          if (column.kind !== "entity") column.kind = "entity";
        }
      });

      dataArray.forEach(({ id: cellId, metadata, annotations }) => {
        if (cellId.includes("$")) {
          const [rowId, colId] = getIdsFromCell(cellId);
          const column = getColumn(draft, colId);
          const cell = getCell(draft, rowId, colId);
          if (!cell || !column) return;

          cell.metadata = metadata.map(({ id, name, ...rest }) => {
            const [, metaId] = id.split(":");
            const computedUri = resolveURI(effectiveReconciliator, {
              id: metaId,
              label: name,
              ...rest,
            });
            return {
              id,
              name: { value: name as unknown as string, uri: computedUri },
              ...rest,
            };
          });
          cell.annotationMeta = {
            annotated: true,
            ...computeCellAnnotationStats(cell),
          };
          cell.reconciler = reconcilerId;
          if (annotations && Object.keys(annotations).length > 0) {
            cell.annotations = annotations;
          }

          const cellPrefix = getCellContext(cell);
          if (cellPrefix) {
            if (!column.context[cellPrefix]) {
              column.context[cellPrefix] = createContext({ uri });
            }
            column.context[cellPrefix].total += 1;
            if (isCellReconciliated(cell)) {
              column.context[cellPrefix].reconciliated += 1;
            }
          }
          column.status = getColumnStatus(draft, colId);
        } else {
          // Column-level result: types and properties.
          const column = getColumn(draft, cellId as ID);
          if (
            column &&
            Array.isArray(column.metadata) &&
            column.metadata.length > 0
          ) {
            if (
              metadata.length > 0 &&
              metadata.some((m) => m.property)
            ) {
              const newProps = metadata.flatMap((metas) => {
                if (metas.property) {
                  return metas.property.map((property: any) => ({
                    ...property,
                    match: true,
                  }));
                }
                return [];
              });
              column.metadata[0].property = [
                ...(column.metadata[0].property || []),
                ...newProps,
              ];
            }
          } else if (column && Array.isArray(column.metadata)) {
            column.metadata[0] = {
              id: "None:",
              match: true,
              score: 0,
              name: { value: "", uri: "" },
              type: metadata.flatMap((metas) => {
                if (metas.type) {
                  return metas.type.map((type: any) => ({ ...type }));
                }
                return [];
              }),
              property: metadata.flatMap((metas) => {
                if (metas.property) {
                  return metas.property.map((property: any) => ({
                    ...property,
                    match: true,
                  }));
                }
                return [];
              }),
            };
            column.annotationMeta = {
              annotated: true,
              ...computeColumnAnnotationStats(column),
            };
            column.reconciler = reconcilerId;
          }
        }
      });

      // Derive which column types are matched from the matched cells.
      colIds.forEach((colId) => {
        const column = getColumn(draft, colId);
        if (!column) return;
        const stats = getColumnTypeStats(draft.entities.rows, colId);
        if (column.metadata && column.metadata[0]?.type) {
          column.metadata[0].type = column.metadata[0].type.map((typeItem: any) => ({
            ...typeItem,
            match: stripPrefix(typeItem.id) in stats,
          }));
        }
      });

      refreshTableCounts(draft);
      refreshScoreBoundaries(draft);
    },
    { operationRef: operationLog ?? null },
  );
};
