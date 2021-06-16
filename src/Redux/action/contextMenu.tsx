import { contextActionInterface } from "../../Interfaces/context-action.interface"
import { contextInterface } from "../../Interfaces/context.interface"

export const addContext = (contextData: contextInterface): contextActionInterface => {
    return{
        type: "ADDCONTEXT",
        context: contextData,
    }
}

export const removeContext = (): contextActionInterface => {
    return {
        type: "REMOVECONTEXT",
    }
}