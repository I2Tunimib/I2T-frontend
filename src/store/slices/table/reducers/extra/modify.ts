import { ID, Payload } from "@store/interfaces/store";
import { createCell } from "../../utils/table.extension-utils";
import { refreshAllColumns } from "../../utils/table.reconciliation-utils";
import { withHistory } from "../history";
import { TableReducer } from "../types";
import {
  addModificationProperties,
  addServiceColumns,
  ServiceColumnsData,
} from "./service-columns";

type ModifyFulfilledPayload = {
  data: ServiceColumnsData & {
    rows?: Record<string, { cells: Record<string, any> }>;
  };
  selectedColumnId?: ID;
  operationLog?: unknown;
};

/**
 * A modification service either answered every row of the table, or added
 * columns next to the modified one.
 */
export const modifyFulfilled: TableReducer<Payload<ModifyFulfilledPayload>> = (
  state,
  { payload: { data, selectedColumnId, undoable = true, operationLog } },
) => {
  const { rows } = data;

  if (rows) {
    return withHistory(
      state,
      undoable,
      (draft) => {
        const columnIds = draft.entities.columns.allIds;
        draft.entities.rows.allIds = Object.keys(rows);
        draft.entities.rows.byId = Object.fromEntries(
          Object.entries(rows).map(([rowId, rowData]) => [
            rowId,
            {
              id: rowId,
              cells: Object.fromEntries(
                columnIds.map((colId) => [
                  colId,
                  createCell(rowId, colId, rowData.cells[colId] ?? { label: "", metadata: [] }),
                ]),
              ),
            },
          ]),
        );
        refreshAllColumns(draft);
      },
      {
        operationRef: operationLog,
        after: (draft) => {
          if (!selectedColumnId || !draft.entities.columns.byId[selectedColumnId]) return;
          const cellIds = draft.entities.rows.allIds.map(
            (rowId) => draft.entities.rows.byId[rowId].cells[selectedColumnId].id,
          );
          draft.ui.selectedColumnsIds = { [selectedColumnId]: true };
          draft.ui.selectedCellIds = Object.fromEntries(cellIds.map((id) => [id, true]));
          draft.ui.selectedColumnCellsIds = Object.fromEntries(cellIds.map((id) => [id, true]));
        },
      },
    );
  }

  return withHistory(
    state,
    undoable,
    (draft) => {
      addServiceColumns(draft, data.columns, selectedColumnId, { keepOldCells: true });
      if (data.originalColMeta?.originalColName) {
        addModificationProperties(draft, data.originalColMeta);
      }
    },
    { operationRef: operationLog },
  );
};
