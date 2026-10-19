import { describe, expect, it } from "vitest";
import { produce } from "immer";
import {
  applyUndoPatches,
  applyRedoPatches,
  produceWithPatch,
  createSliceWithUndo,
  _getSliceWithUndoConfig,
} from "../undo";

const baseState = {
  value: 0,
  _draft: {
    patches: [] as any[],
    inversePatches: [] as any[],
    operationRefs: [] as any[],
    redoOperationRefs: [] as any[],
    undoPointer: -1,
    redoPointer: -1,
  },
};

function runProduceWithPatch(
  state: any,
  undoable: boolean,
  mutations: (draft: any) => void,
  after?: (draft: any) => void,
  opRef: unknown = null,
) {
  return (produce as any)(state, (draft: any) => {
    return produceWithPatch(draft, undoable, mutations, after, opRef);
  });
}

function runApplyUndoPatches(state: any, steps = 1) {
  return (produce as any)(state, (draft: any) => {
    return applyUndoPatches(draft, steps);
  });
}

function runApplyRedoPatches(state: any) {
  return (produce as any)(state, (draft: any) => {
    return applyRedoPatches(draft);
  });
}

describe("produceWithPatch", () => {
  it("applies mutations and records patches when undoable", () => {
    const next = runProduceWithPatch(baseState, true, (draft) => {
      draft.value = 1;
    });
    expect(next.value).toBe(1);
    expect(next._draft.undoPointer).toBe(0);
    expect(next._draft.patches).toHaveLength(1);
    expect(next._draft.inversePatches).toHaveLength(1);
    expect(next._draft.operationRefs).toEqual([null]);
  });

  it("skips patches when undoable is false", () => {
    const next = runProduceWithPatch(baseState, false, (draft) => {
      draft.value = 1;
    });
    expect(next.value).toBe(1);
    expect(next._draft.patches).toHaveLength(0);
    expect(next._draft.inversePatches).toHaveLength(0);
    expect(next._draft.undoPointer).toBe(-1);
  });

  it("runs mutationsWithoutPatches after the main mutation", () => {
    const next = runProduceWithPatch(
      baseState,
      true,
      (draft) => {
        draft.value = 1;
      },
      (draft) => {
        draft.value += 100;
      },
    );
    expect(next.value).toBe(101);
    expect(next._draft.patches).toHaveLength(1);
  });

  it("rewrites history when a new change is made after an undo", () => {
    const state1 = runProduceWithPatch(baseState, true, (d) => {
      d.value = 1;
    });
    const state2 = runProduceWithPatch(state1, true, (d) => {
      d.value = 2;
    });
    const undone = runApplyUndoPatches(state2, 1);
    const next = runProduceWithPatch(undone, true, (d) => {
      d.value = 3;
    });
    expect(next.value).toBe(3);
    expect(next._draft.redoPointer).toBe(-1);
    expect(next._draft.undoPointer).toBe(1);
  });
});

describe("applyUndoPatches", () => {
  it("undoes one step by default", () => {
    const state1 = runProduceWithPatch(baseState, true, (d) => {
      d.value = 1;
    });
    const state2 = runProduceWithPatch(state1, true, (d) => {
      d.value = 2;
    });
    const undone = runApplyUndoPatches(state2, 1);
    expect(undone.value).toBe(1);
    expect(undone._draft.undoPointer).toBe(0);
    expect(undone._draft.redoPointer).toBe(0);
  });

  it("undoes several steps at once", () => {
    const state1 = runProduceWithPatch(baseState, true, (d) => {
      d.value = 1;
    });
    const state2 = runProduceWithPatch(state1, true, (d) => {
      d.value = 2;
    });
    const undone = runApplyUndoPatches(state2, 2);
    expect(undone.value).toBe(0);
    expect(undone._draft.undoPointer).toBe(-1);
    expect(undone._draft.redoPointer).toBe(1);
  });

  it("returns state unchanged when nothing to undo", () => {
    const next = runApplyUndoPatches(baseState);
    expect(next).toBe(baseState);
    expect(next.value).toBe(0);
  });

  it("returns state unchanged when steps is 0", () => {
    const state1 = runProduceWithPatch(baseState, true, (d) => {
      d.value = 1;
    });
    const next = runApplyUndoPatches(state1, 0);
    expect(next).toBe(state1);
  });

  it("applies mutations after undoing", () => {
    const state1 = runProduceWithPatch(baseState, true, (d) => {
      d.value = 1;
    });
    const undone = runApplyUndoPatches(state1, 1);
    const next = runProduceWithPatch(undone, true, (d) => {
      d.value = 5;
    });
    expect(next.value).toBe(5);
  });
});

describe("applyRedoPatches", () => {
  it("redoes one step", () => {
    const state1 = runProduceWithPatch(baseState, true, (d) => {
      d.value = 1;
    });
    const undone = runApplyUndoPatches(state1, 1);
    const redone = runApplyRedoPatches(undone);
    expect(redone.value).toBe(1);
    expect(redone._draft.redoPointer).toBe(-1);
    expect(redone._draft.undoPointer).toBe(0);
  });

  it("returns state unchanged when nothing to redo", () => {
    const state1 = runProduceWithPatch(baseState, true, (d) => {
      d.value = 1;
    });
    const next = runApplyRedoPatches(state1);
    expect(next).toBe(state1);
    expect(next.value).toBe(1);
  });
});

describe("createSliceWithUndo", () => {
  const undoSlice = createSliceWithUndo({
    name: "undoTest",
    initialState: { value: 0, _draft: { patches: [], inversePatches: [], operationRefs: [], redoOperationRefs: [], undoPointer: -1, redoPointer: -1 } },
    reducers: {
      setValue: (state, action) => {
        state.value = action.payload;
      },
    },
  });

  const reducer = undoSlice.reducer;
  const { setValue, undo, redo } = undoSlice.actions as any;

  it("adds undo and redo reducers", () => {
    expect(typeof undo).toBe("function");
    expect(typeof redo).toBe("function");
    expect(typeof setValue).toBe("function");
  });

  it("undo with nothing to undo returns state unchanged", () => {
    const state = reducer(undefined, { type: "@@init" });
    const next = reducer(state, undo());
    expect(next).toBe(state);
    expect(next.value).toBe(0);
  });

  it("redo with nothing to redo returns state unchanged", () => {
    const state = reducer(undefined, { type: "@@init" });
    const next = reducer(state, redo());
    expect(next).toBe(state);
    expect(next.value).toBe(0);
  });
});

describe("_getSliceWithUndoConfig", () => {
  it("returns undo and redo reducers config", () => {
    const config = _getSliceWithUndoConfig();
    expect(config.reducers.undo).toBeDefined();
    expect(config.reducers.redo).toBeDefined();
  });
});
