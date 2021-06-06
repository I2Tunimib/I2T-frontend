import produce from "immer";

export const loadDataSuccessReducer = (state = [], action) => {
    switch(action.type) {
        case "LOADED":
            for (let i = 0; i < action.data.length; i++) {
                action.data[i]['index'] = i;
                /*const lineKeys = Object.keys(action.data[i])
                for (let k = 0; k < lineKeys.length; k++) {
                    action.data[i][lineKeys[i]] = {
                        label: action.data[i][lineKeys[i]],
                        metadata: [],
                    }
                }*/
            }
            return state = action.data;
        case "CANCELDATA":
            return state = [];
        case "UPDATELINE":
            const nextState = produce(state, draftState => {
                draftState[action.index] = action.line;
            })
            return state = nextState;
        case "DELETELINE":
            return state = [
                ...state.slice(0, action.index),
                ...state.slice(action.index + 1)
            ]
        default:
            return state;
    }
}