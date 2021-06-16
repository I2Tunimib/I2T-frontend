import { errorActionInterface } from "../../Interfaces/error-action.interface"

export const displayError = (error: string): errorActionInterface => {
    return {
        type: "ERROR",
        error,
    }
}

export const noError = (): errorActionInterface => {
    return {
        type: "NOERROR",
    }
}