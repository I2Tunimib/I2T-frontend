import produce from "immer";

export const loadDataSuccessReducer = (state = [], action) => {
    switch(action.type) {
        case 'LOADSAVED':
            console.log(action.data);
            return state = action.data;
        case "LOADED":
            for (let i = 0; i < action.data.length; i++) {
                action.data[i]['index'] = i + 1;
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
            const newState = [
                ...state.slice(0, action.index),
                ...state.slice(action.index + 1)
            ]
            console.log(newState.length);
            for (let i = 0; i < newState.length; i++){
                newState[i]["index"] = {label: (i + 1).toString(), metadata: []};
            }
            console.log(newState);
            return newState;
        case "ADDMETA":
             const nextStateMeta = produce(state, draftState => {
                 draftState[action.index][action.colName].metadata = action.metadata
             })
             return state = nextStateMeta;
        case "EXTENDMETA":
            console.log(action.colName);
            const extendedState = JSON.parse(JSON.stringify(state));
            for (const row of extendedState) {
                const keys = Object.keys(row);
                for (const key of keys) {
                    if (key === action.colName) {
                        // console.log(key);
                        const idArray = [];
                        for (const feature of row[key].metadata){
                            idArray.push(feature.id);
                        }
                        row[`${action.colName} (${action.reconciliator})`] = idArray;
                    }
                }
            }
            return state = extendedState;
        default:
            return state;
    }
}