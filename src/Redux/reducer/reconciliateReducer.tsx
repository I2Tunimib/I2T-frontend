import { reconciliateActionInterface } from "../../Interfaces/reconciliate-action.interface";

const reconciliateReducer = (state = [], action: reconciliateActionInterface): any => {
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