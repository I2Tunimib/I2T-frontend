import { Draft } from "@reduxjs/toolkit";
import { produceWithPatch } from "@store/enhancers/undo";
import { TableState } from "../interfaces/table";

type State = Draft<TableState>;

type Options = {
  /** The backend operation this step belongs to, kept with the step. */
  operationRef?: unknown;
  /** Changes that must not be undone with the step (e.g. clearing selection). */
  after?: (draft: State) => void;
  /** Mark the table as modified (default). */
  stamp?: boolean;
};

export const stampModified = (draft: State) => {
  draft.entities.tableInstance.lastModifiedDate = new Date().toISOString();
};

/**
 * Change the table as one step of the undo history.
 *
 * `recipe` is what undo reverts. When `undoable` is false the recipe is just
 * applied, and `after` and the modification date are skipped.
 */
export const withHistory = (
  state: State,
  undoable: boolean,
  recipe: (draft: State) => void,
  { operationRef, after, stamp = true }: Options = {},
) =>
  produceWithPatch(
    state,
    undoable,
    recipe,
    (draft) => {
      after?.(draft);
      if (stamp) stampModified(draft);
    },
    operationRef ?? null,
  );
