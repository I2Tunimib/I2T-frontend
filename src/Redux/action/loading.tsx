import { loadingActionInterface } from "../../Interfaces/loading-action.interface"

export const setLoadingState = (): loadingActionInterface => {
    return {
        type: "LOADING",
    }
}

export const unsetLoadingState = (): loadingActionInterface => { 
     return {
         type: "NOT LOADING",
     }
}