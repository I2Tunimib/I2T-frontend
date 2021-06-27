import { configInterface } from "../../Interfaces/configInterface"

export const getConfigData = (configData: configInterface) => {
    return ({
        type: "GETCONFIG",
        configData,
    })
}