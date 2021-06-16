import { getReconciliatorsActionInterface } from "../../Interfaces/get-reconciliators-action.interface";
import { reconciliatorInterface } from "../../Interfaces/reconciliator.interface";

const getReconciliatorsReducer = (state: reconciliatorInterface[] = [], action: getReconciliatorsActionInterface) => {
    switch(action.type){
        case "GETRECONCILIATORS":
            return state = action.reconciliators;
        default: 
            return state;
    }
}

export default getReconciliatorsReducer;