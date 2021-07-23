import produce from "immer";
import { colActionIterface } from "../../Interfaces/col-action.interface";
import { colInterface } from "../../Interfaces/col.interface";

const columnsReducer = (state: colInterface[] = [], action: colActionIterface) => {
    switch(action.type) {
        case "LOADCOLUMNS":
            return state = action.columns!;
        case "SELECTCOL":
            let colToSelectIndex: number | null = null;
            for (let i = 0; i < state.length; i++) {
                if(state[i].name === action.column) {
                    colToSelectIndex = i;
                    break;
                }
            }
            const nextState = produce(state, draftState => {
                draftState[colToSelectIndex!].selected = true;
            })
            return state = nextState;
        case "DESELECTCOL":
            let colToDeselectIndex: number | null = null;
            for (let j = 0; j < state.length; j++) {
                if(state[j].name === action.column) {
                    colToDeselectIndex = j;
                    break;
                }
            }
            const nextState2 = produce(state, draftState => {
                draftState[colToDeselectIndex!].selected = false;
            })
            //console.log(nextState2);
            return state = nextState2;
        case "DELETECOL":
            let colToDeleteIndex = null;
            for (let z = 0; z < state.length; z++) {
                if (state[z].name === action.column) {
                    colToDeleteIndex = z;
                }
            }
            const newState = [...state.slice(0, colToDeleteIndex!), ...state.slice(colToDeleteIndex! + 1)];
            return state = newState;
        case "DELETEALLCOLS":
            return state = [];
        case "RECONCILIATECOL":
            let reconciliateColIndex: number | null = null;
            for (let g = 0; g < state.length; g++) {
                if (state[g].name === action.column){
                    reconciliateColIndex = g;
                }
            }
            const nextState3 = produce(state, draftState => {
                draftState[reconciliateColIndex!].reconciliator = action.reconciliator;
                draftState[reconciliateColIndex!].reconciliated = true;
            })
            return nextState3;
        case "ADDEXTMETACOL":
            let indexToextend: number | null = null; 
            //console.log(action.extendedCol);
            for (let t = 0; t < state.length; t++) {
                if (state[t].name === action.extendedCol) {
                    indexToextend = t;
                }
            }
            const newState2 = produce(state, draftState => {
                draftState[indexToextend!].extendedMeta = action.isExtended;
            })
            /*const newCol = {
                label: action.column!,
                name: action.column!,
                type: action.colType!,
                selected: false,
                new: true,
                reconciliated: false,
                reconciliator: "",
            }
            let extendedColIndex: number | null = null;
            for (let y = 0; y < state.length; y++) {
                if(action.extendedCol === state[y].name) {
                    extendedColIndex = y;
                }
            }
            const newState2 = [...state.slice(0, extendedColIndex! + 1), newCol, ...state.slice(extendedColIndex! + 1)]*/
            return state = newState2;
        case "ADDFILTER":
            const filteredCols = produce(state, draftState => {
                for (let f = 0; f < state.length; f++ ) {
                    draftState[f].filtered = null;
                    if (state[f].name === action.column) {
                        draftState[f].filtered = action.filter;
                    }
                }
            })
            return state = filteredCols;
        case "REMOVEFILTER":
            const unfilteredCols = produce(state, draftState => {
                for (const col of draftState) {
                    col.filtered = null; 
                }
            })
            return state = unfilteredCols;
        case "ADDMETACOLUMN": 
            const addedMetaCols = produce(state, draftState => {
                for (const col of draftState){
                    if(col.name === action.column) {
                        col.metadata = action.meta
                    }
                }
            })
            return state = addedMetaCols;
        default :
            return state;
    }
}

export default columnsReducer;