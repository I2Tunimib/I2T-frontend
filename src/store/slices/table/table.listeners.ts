import { createListenerMiddleware } from "@reduxjs/toolkit";
import tableAPI from "@services/api/table";
import { propagateCellMetadata } from "./table.slice";

/**
 * Listener middleware for the table slice.
 *
 * Side effects that belong to a table action but must not run inside a
 * reducer (they would break undo patches / serialization) live here.
 */
export const listenerMiddleware = createListenerMiddleware();

/**
 * When a cell metadata candidate is propagated to same-labelled cells, tell
 * the backend which candidate was propagated, using the state as it was
 * before the change (getOriginalState).
 */
listenerMiddleware.startListening({
  actionCreator: propagateCellMetadata,
  effect: (action, listenerApi) => {
    const { cellId, metadataId } = action.payload as any;
    const originalState = listenerApi.getOriginalState() as any;
    const [rowId, colId] = cellId.split("$");
    const cell = originalState.table.entities.rows.byId[rowId]?.cells[colId];
    const currentMetadata = cell?.metadata.find((m: any) => m.id === metadataId);
    if (!currentMetadata) return;

    void tableAPI.trackTable(
      originalState.table.entities.tableInstance.idDataset,
      originalState.table.entities.tableInstance.id,
      {
        operationType: "PROPAGATE_TYPE",
        columnName: colId,
        payload: {
          id: metadataId,
          match: currentMetadata.match,
          originalValue: cell.label,
        },
      },
    );
  },
});
