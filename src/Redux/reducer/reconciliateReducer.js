const reconciliateReducer = (state = [], action) => {
    switch(action.type){
        case "RECONCILIATE":
            return state = action.payload;
        case "NORECONCILIATE":
            return state = [];
        default:
            return state;
    }
}

export default reconciliateReducer;