import { ID, Payload } from "@store/interfaces/store";
import { withHistory } from "../history";
import { TableReducer } from "../types";
import {
  addExtensionMetadata,
  addServiceColumns,
  ServiceColumnsData,
} from "./service-columns";

type ExtendFulfilledPayload = {
  data: ServiceColumnsData;
  selectedColumnId?: ID;
  operationLog?: unknown;
};

/** An extension service added columns next to the extended one. */
export const extendFulfilled: TableReducer<Payload<ExtendFulfilledPayload>> = (
  state,
  { payload: { data, selectedColumnId, undoable = true, operationLog } },
) =>
  withHistory(
    state,
    undoable,
    (draft) => {
      addServiceColumns(draft, data.columns, selectedColumnId);
      if (data.originalColMeta?.originalColName) {
        addExtensionMetadata(draft, data.originalColMeta);
      }
    },
    { operationRef: operationLog },
  );
