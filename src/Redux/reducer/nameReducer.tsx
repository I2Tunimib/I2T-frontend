import { nameActionInterface } from "../../Interfaces/name-action.interface";

const nameLoadReducer = (state = "", action: nameActionInterface ):string => {
    switch(action.type) {
        case "LOADNAME":
            return state = action.name!;
        case "DELETENAME":
            return state = "";
        default: 
            return state;
    }
}
export default nameLoadReducer;