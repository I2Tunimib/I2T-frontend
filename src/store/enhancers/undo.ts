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
    /**
     * Redo patches.
     */
    patches: Patch[][];
    /**
     * Undo patches.
     */
    inversePatches: Patch[][];
    /**
     * Pointer to the current undo version.
     */
    undoPointer: number;
    /**
     * Pointer to the current redo version.
     */
    redoPointer: number;
  }
}

/**
 * When in the middle of the undo stack remove
 * patches from unreachable timeline and reset pointers.
 * @private
 */
const _rewriteHistory = <T extends UndoEnhancedState>(draft: Draft<Immutable<T>>) => {
  if (draft._draft.undoPointer === -1) {
    draft._draft.inversePatches = [];
    draft._draft.patches = [];
  } else {
    draft._draft.inversePatches = draft._draft.inversePatches
      .slice(0, draft._draft.undoPointer + 1);
    draft._draft.patches = draft._draft.patches
      .slice(draft._draft.redoPointer + 1);
  }
  draft._draft.redoPointer = -1;
};

/**
 * Allow the creation of the new state with the generation of patches.
 */
export const produceWithPatch = <T extends UndoEnhancedState>(
  state: T,
  /**
   * if true it generates patches and inverse patches for 'mutations'
   */
  undoable: boolean,
  /**
   * Mutations which can be undoable.
   */
  mutations: (draft: T) => void,
  /**
   * Mutation executed during the same state change withtout generating patches.
   */
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
      if (draft._draft.redoPointer > -1) {
        _rewriteHistory(draft);
      }
      draft._draft.patches.unshift(patches);
      draft._draft.inversePatches.push(inversePatches);
      draft._draft.undoPointer += 1;
    }
  }) as T;
};

/**
 * Apply patches for current version.
 */
/*export const applyUndoPatches = <T extends UndoEnhancedState>(
  state: T, mutations?: (draft: T) => void
) => {
  if (state._draft.undoPointer > -1) {
    state._draft.redoPointer += 1;
    const newDraft = applyPatches(state, state._draft.inversePatches[state._draft.undoPointer--]);
    if (mutations) {
      mutations(newDraft);
    }
    return newDraft;
  }
};*/
export const applyUndoPatches = <T extends UndoEnhancedState>(
  state: T, 
  steps = 1, // (default 1)
  mutations?: (draft: T) => void
) => {
  if (state._draft.undoPointer < 0 || steps <= 0) {
    return state; // No patches to apply
  }

  let newDraft = state;

  // Limit steps to max available undo steps
  const actualSteps = Math.min(steps, state._draft.undoPointer + 1);

  // Apply patches
  for (let i = 0; i < actualSteps; i++) {
    state._draft.redoPointer += 1;
    newDraft = applyPatches(newDraft, state._draft.inversePatches[state._draft.undoPointer--]);
  }

  if (mutations) {
    mutations(newDraft);
  }

  return newDraft;
};

/**
 * Apply inverse patches for current version.
 */
export const applyRedoPatches = <T extends UndoEnhancedState>(
  state: T, mutations?: (draft: T) => void
) => {
  if (state._draft.redoPointer > -1) {
    state._draft.undoPointer += 1;
    const newDraft = applyPatches(state, state._draft.patches[state._draft.redoPointer--]);
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
      redo: redoReducer,
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
