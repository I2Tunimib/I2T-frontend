import {
  CreateSliceOptions, createSlice,
  PayloadAction, Draft
} from '@reduxjs/toolkit';
import produce, {
  applyPatches, original,
  produceWithPatches, Patch, Immutable
} from 'immer';

/**
 * State slice which includes undo and redu patches.
 */
export interface UndoEnhancedState {
  _draft: {
    past: Patch[][];
    present: Patch[];
    future: Patch[][];
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
  mutations: (draft: T) => void,
  mutationsWithoutPatches?: (draft: Draft<Immutable<T>>) => void
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

  return produce(nextState, (draft) => {
    if (draft) {
      if (mutationsWithoutPatches) {
        mutationsWithoutPatches(draft);
      }
      if (draft._draft.future.length > 0) {
        draft._draft.future = [];
      }
      draft._draft.past.push([...inversePatches, ...draft._draft.present]);
      draft._draft.present = patches;
    }
  }) as T;
};

/**
 * Apply undo patches and set past, present and future patches.
 */
export const applyUndoPatches = <T extends UndoEnhancedState>(
  state: T, mutations?: (draft: T) => void
) => {
  if (state._draft.past.length > 0) {
    const presentPatch = state._draft.past.pop();
    state._draft.future.push(state._draft.present);
    state._draft.present = presentPatch || [];
    const newDraft = applyPatches(state, state._draft.present);
    if (mutations) {
      mutations(newDraft);
    }
    return newDraft;
  }
};

/**
 * Apply redo patches and set past, present and future patches.
 */
export const applyRedoPatches = <T extends UndoEnhancedState>(
  state: T, mutations?: (draft: T) => void
) => {
  if (state._draft.future.length > 0) {
    const presentPatch = state._draft.future.pop();
    state._draft.past.push(state._draft.present);
    state._draft.present = presentPatch || [];
    const newDraft = applyPatches(state, state._draft.present);
    if (mutations) {
      mutations(newDraft);
    }
    return newDraft;
  }
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
