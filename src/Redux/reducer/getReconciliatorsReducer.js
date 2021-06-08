const getReconciliatorsReducer = (state = [], action) => {
    switch(action.type){
        case "GETRECONCILIATORS":
            return state = action.reconciliators;
        default: 
            return state;
    }
}

export default getReconciliatorsReducer;