import produce from "immer";

const toExtendColsReducer = (state =[], action) => {
    switch(action.type) {
        case "SETTOEXTENDCOL":
            const nextState = produce(state, draftstate => {
                draftstate.push(action.colsInfo);
            })
            return state = nextState;
        case "DELETETOEXTENDCOL":
            return state = [];
        default:
            return state;
    }
}

export default toExtendColsReducer;