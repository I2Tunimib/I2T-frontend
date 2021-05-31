import produce from "immer";

const toExtendRowsReducer = (state =[], action) => {
    switch(action.type) {
        case "SETTOEXTENDCOL":
            const nextState = produce(state, draftstate => {
                draftstate.push(action.colsInfo);
            })
            return state = nextState;
        case "POPTOEXTENDCOL":
            let indexToRemove = null;
            console.log(action.indexToPop);
            for (let i = 0; i < state.length; i++) {
                console.log(state[i].rowIndex);
                if (state[i].rowIndex === action.indexToPop) {
                    indexToRemove = i;
                    break;
                }
            }
            if (indexToRemove !== null) {
                let newState = JSON.parse(JSON.stringify(state));
                newState = [...newState.slice(0, indexToRemove), ...newState.slice(indexToRemove +1)]
                return state = newState;
            } else {
                console.log("an error occurred removing a toEstendCol");
                return state;
            }
           

        case "DELETETOEXTENDCOL":
            return state = [];
        default:
            return state;
    }
}

export default toExtendRowsReducer;