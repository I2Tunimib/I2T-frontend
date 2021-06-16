import { contextTypeEnum } from "../Enums/context-type.enum";
import { contextItemInterface } from "./context-items.interface";

export interface contextInterface {
    xPos: number,
    yPos: number,
    type: contextTypeEnum,
    items: contextItemInterface[],
}