import { reconciliateActionInterface } from "../../Interfaces/reconciliate-action.interface"

export const reconciliate = (payload: any): reconciliateActionInterface => {
    return({
        type: "RECONCILIATE",
        payload
    })
}

export const noReconciliate = () => {
    return ({
        type: "NORECONCILIATE",
    })
}