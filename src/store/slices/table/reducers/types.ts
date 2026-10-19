import { CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { TableState } from "../interfaces/table";

/** A reducer of the table state for an action with the given payload. */
export type TableReducer<P = void> = CaseReducer<TableState, PayloadAction<P>>;
