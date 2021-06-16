import { reconciliatorInterface } from "./reconciliator.interface";

export interface getReconciliatorsActionInterface {
    type: string,
    reconciliators: reconciliatorInterface[],
}