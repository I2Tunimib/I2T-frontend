import produce from "immer";

export const loadDataSuccessReducer = (state = [], action) => {
    switch(action.type) {
        case "LOADED":
            return state = action.data;
        case "CANCELDATA":
            return state = [];
        case "UPDATELINE":
        const nextState = produce(state, draftState => {
            draftState[action.index] = action.line;
        })
        return state = nextState;
        default:
            return state;
    }
}