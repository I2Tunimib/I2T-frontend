import { getReconciliatorsActionInterface } from "../../Interfaces/get-reconciliators-action.interface"
import { reconciliatorInterface } from "../../Interfaces/reconciliator.interface"

export const getReconciliators = (reconciliators: reconciliatorInterface[]) :getReconciliatorsActionInterface => {
    return({
        type: "GETRECONCILIATORS",
        reconciliators,
    })
}