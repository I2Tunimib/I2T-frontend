import {
  CreateSliceOptions, createSlice,
  PayloadAction, Draft, ValidateSliceCaseReducers, SliceCaseReducers
} from '@reduxjs/toolkit';
import produce, {
  applyPatches, original,
  produceWithPatches, Patch
} from 'immer';

/**
 * State slice which includes undo and redu patches.
 */
export interface UndoEnhancedState {
  _draft: {
    changes: Record<string, PatchItem>,
    currentVersion: number,
    canUndo: boolean;
    canRedo: boolean;
  }
}
/**
 * An change Item
 */
interface PatchItem {
  undo: Patch[];
  redo: Patch[];
}

/**
 * Allow the creation of the new state with the generation of patches.
 */
export const produceWithPatch = <T extends UndoEnhancedState>(
  state: T,
  undoable: boolean,
  mutations: (draft: T) => void
) => {
  if (!undoable) {
    mutations(state);
    return;
  }

  const [nextState, patches, inversePatches] = produceWithPatches(
    original(state),
    (draft: T) => {
      mutations(draft);
    }
  );

  // eslint-disable-next-line consistent-return
  return produce(nextState, (draft) => {
    if (draft) {
      draft._draft.currentVersion += 1;
      draft._draft.changes[draft._draft.currentVersion] = {
        redo: patches,
        undo: inversePatches
      };
      draft._draft.canUndo = true;
      draft._draft.canRedo = false;
    }
  }) as T;
};

/**
 * Apply undo patches and set 'canUndo' and 'canRedo' states.
 * Additional mutations can be passed to this function.
 */
export const applyUndoPatches = <T extends UndoEnhancedState>(
  state: T, mutations?: (draft: T) => void
) => {
  const newDraft = applyPatches(state, state._draft.changes[state._draft.currentVersion--].undo);
  newDraft._draft.canUndo = !!newDraft._draft.changes[state._draft.currentVersion];
  newDraft._draft.canRedo = true;
  if (mutations) {
    mutations(newDraft);
  }
  return newDraft;
};

/**
 * Apply redo patches and set 'canUndo' and 'canRedo' states.
 * Additional mutations can be passed to this function.
 */
export const applyRedoPatches = <T extends UndoEnhancedState>(
  state: T, mutations?: (draft: T) => void
) => {
  const newDraft = applyPatches(state, state._draft.changes[++state._draft.currentVersion].redo);
  newDraft._draft.canUndo = true;
  newDraft._draft.canRedo = !!newDraft._draft.changes[newDraft._draft.currentVersion + 1];
  if (mutations) {
    mutations(newDraft);
  }
  return newDraft;
};

const undoReducer = <T extends UndoEnhancedState>(
  state: Draft<T>, action: PayloadAction<void>
) => {
  return applyUndoPatches(state);
};

const redoReducer = <T extends UndoEnhancedState>(
  state: Draft<T>, action: PayloadAction<void>
) => {
  return applyRedoPatches(state);
};

/**
 * Extension of createSlice.
 * It automatically adds reducers to handle undo and redo operations.
 */
export const createSliceWithUndo = <T extends UndoEnhancedState>(
  options: CreateSliceOptions<T>
) => {
  const { initialState, ...rest } = options;

  return createSlice({
    ...rest,
    initialState,
    reducers: {
      ...rest.reducers,
      undo: undoReducer,
      redo: redoReducer
    }
  });
};

export const _getSliceWithUndoConfig = () => {
  return {
    reducers: {
      undo: undoReducer,
      redo: redoReducer
    }
  };
};
