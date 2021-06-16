import { contextActionInterface } from "../../Interfaces/context-action.interface";
import { contextInterface } from "../../Interfaces/context.interface";

const contextReducer = (state: contextInterface | null = null, action: contextActionInterface) => {
    switch(action.type) {
        case "ADDCONTEXT":
            return state = action.context!;
        case "REMOVECONTEXT":
            return state = null;
        default:
            return state;
    }
}
export default contextReducer;