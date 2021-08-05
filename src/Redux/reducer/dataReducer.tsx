import produce from "immer";
import { dataActionInterface } from "../../Interfaces/data-action.interface";

export const loadDataSuccessReducer = (state: any[] = [], action: dataActionInterface) => {
    switch (action.type) {
        case 'LOADSAVED':
            console.log(action.data);
            return state = action.data!;
        case "LOADED":
            for (let i = 0; i < action.data!.length; i++) {
                action.data![i]['index'] = i + 1;
                const lineKeys = Object.keys(action.data![i])
                for (let k = 0; k < lineKeys.length; k++) {
                    action.data![i][lineKeys[k]] = {
                        type: "DATA",
                        label: action.data![i][lineKeys[k]],
                        metadata: [],
                        ids: [],
                    }
                }
            }
            return state = action.data!;
        case "CANCELDATA":
            return state = [];
        case "UPDATELINE":
            const lineKeys = Object.keys(action.line);
            for (const key of lineKeys) {
                action.line[key] = {
                    label: action.line[key].label,
                    metadata: action.line[key].metadata,
                    type: action.line[key].type,
                    ids: action.line[key].ids,
                }
            }
            const nextState = produce(state, draftState => {
                draftState[action.index!] = action.line;
            })
            return state = nextState;
        case "DELETELINE":
            const newState = [
                ...state.slice(0, action.index),
                ...state.slice(action.index! + 1)
            ]
            //console.log(newState.length);
            /*for (let i = 0; i < newState.length; i++) {
                console.log(i);
                newState[i]["index"] = {
                    type: "INDEX",
                    label: (i + 1).toString(),
                    metadata: [],
                    ids: [],
                };
            }*/
            const nextStateReassignIndex = produce(newState, draftState => {
                for (let i = 0; i < newState.length; i++) {
                    draftState[i]['index'] = {
                        type: "INDEX",
                        label: (i + 1).toString(),
                        metadata: [],
                        ids: [],
                    }
                }
            })
            //console.log(newState);
            return nextStateReassignIndex;
        case "ADDMETA":
            const nextStateMeta = produce(state, draftState => {
                draftState[action.index!][action.colName!].metadata = action.metadata
            })
            return state = nextStateMeta;
        case "EXTENDMETA":
            //console.log(action.colName);
            const extendedState = JSON.parse(JSON.stringify(state));
            for (const row of extendedState) {
                const keys = Object.keys(row);
                for (const key of keys) {
                    if (key === action.colName) {
                        // console.log(key);
                        const idArray = [];
                        for (const feature of row[key].metadata) {
                            idArray.push(feature.id);
                        }
                        row[`${action.colName} (${action.reconciliator})`] = {
                            type: "METAID",
                            label: "",
                            metadata: [],
                            ids: idArray,
                        };
                    }
                }
            }
            return state = extendedState;
        case "ADDALLMETA":
            // const nextMetaState = JSON.parse(JSON.stringify(state));
            /*for (const item of action.responseMeta!.items) {
                
            }*/
            const nextMetaState = produce (state, draftState => {
                for ( const item of action.responseMeta!.items) {
                    draftState[item.index][item.column].metadata = item.metadata;
                    const idsArr = [];
                    for (const el of item.metadata) {
                        idsArr.push(el.id);
                    }
                    draftState[item.index][item.column].ids = idsArr;
                }
            }) 
            return state = nextMetaState;
        default:
            return state;
    }
}