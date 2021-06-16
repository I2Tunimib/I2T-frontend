import { nameActionInterface } from "../../Interfaces/name-action.interface"

export const loadName = (name: string): nameActionInterface => {
    return {
        type: "LOADNAME",
        name
    }
}

export const deleteName = (): nameActionInterface => {
    return {
        type: "DELETENAME",
    }
}