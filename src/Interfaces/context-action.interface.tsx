import { contextInterface } from "./context.interface";

export interface contextActionInterface {
    type: string,
    context?: contextInterface,
}