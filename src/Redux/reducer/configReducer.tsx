import { configInterface } from "../../Interfaces/configInterface";

const configReducer = (state: null | configInterface = null, action: {type: string, configData: configInterface} ) => {
    switch(action.type) {
        case "GETCONFIG":
             return state = action.configData;
        default:
            return state;
    }
}

export default configReducer;