import { loadingActionInterface } from "../../Interfaces/loading-action.interface";

const loadingReducer = (state = false, action: loadingActionInterface): boolean => {
    switch (action.type) {
        case "LOADING":
            return state = true;
        case "NOT LOADING":
            return state = false;
        default:
            return state;
    }
}

export default loadingReducer;