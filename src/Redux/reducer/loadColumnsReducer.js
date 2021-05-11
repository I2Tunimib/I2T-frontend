import produce from "immer";

const loadColumnsReducer = (state = [], action) => {
    switch(action.type) {
        case "LOADCOLUMNS":
            return state = action.columns
        case "SELECTCOL":
            let colToSelectIndex = null;
            for (let i = 0; i < state.length; i++) {
                if(state[i].name === action.column) {
                    colToSelectIndex = i;
                    break;
                }
            }
            const nextState = produce(state, draftState => {
                draftState[colToSelectIndex].selected = true;
            })
            return state = nextState;
        case "DESELECTCOL":
            let colToDeselectIndex = null;
            for (let j = 0; j < state.length; j++) {
                if(state[j].name === action.column) {
                    colToDeselectIndex = j;
                    break;
                }
            }
            const nextState2 = produce(state, draftState => {
                draftState[colToDeselectIndex].selected = false;
            })
            console.log(nextState2);
            return state = nextState2;
        case "DELETECOL":
            // deleet
        default :
            return state;
    }
}

export default loadColumnsReducer;