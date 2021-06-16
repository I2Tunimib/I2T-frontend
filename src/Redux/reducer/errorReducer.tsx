import { errorActionInterface } from "../../Interfaces/error-action.interface";

export const errorHandlerReducer = (state: string | boolean = false, action: errorActionInterface) => {
    const error = action.error; 
    switch(action.type) {
        case "ERROR":
            return state = error || 'Unknown error';
        case "NOERROR":
            return state = false;
        default:
            return state;
    }
}
