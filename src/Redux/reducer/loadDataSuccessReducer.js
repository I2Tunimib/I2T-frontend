import produce from "immer";

export const loadDataSuccessReducer = (state = [], action) => {
    switch(action.type) {
        case 'LOADEDSAVED':
            return state = action.data;
        case "LOADED":
            for (let i = 0; i < action.data.length; i++) {
                action.data[i]['index'] = i;
                const lineKeys = Object.keys(action.data[i])
                for (let k = 0; k < lineKeys.length; k++) {
                    action.data[i][lineKeys[k]] = {
                        label: action.data[i][lineKeys[k]],
                        metadata: [],
                    }
                }
            }
            return state = action.data;
        case "CANCELDATA":
            return state = [];
        case "UPDATELINE":
            const lineKeys = Object.keys(action.line);
            for (const key of lineKeys) {
                action.line[key] = {
                    label: action.line[key].label,
                    metadata: action.line[key].metadata,
                } 
            }
            const nextState = produce(state, draftState => {
                draftState[action.index] = action.line;
            })
            return state = nextState;
        case "DELETELINE":
            return state = [
                ...state.slice(0, action.index),
                ...state.slice(action.index + 1)
            ]
        case "ADDMETA":
             const nextStateMeta = produce(state, draftState => {
                 draftState[action.index][action.colName].metadata = action.metadata
             })
             return state = nextStateMeta;
        default:
            return state;
    }
}