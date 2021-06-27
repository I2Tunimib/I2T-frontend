import { addAllMetaActionInterface } from "../../Interfaces/add-all-meta-action.interface"
import { dataActionInterface } from "../../Interfaces/data-action.interface"
import { metaResponseInterface } from "../../Interfaces/meta-response.interface"

export const loadDataSuccess = (data: any []): dataActionInterface => {
    return {
        type: "LOADED",
        data,
    }
}
export const deleteData = (): dataActionInterface => {
    return{
        type:"CANCELDATA"
    }
}
// TODO change reference here
export const updateLine = (index: number, line: any): dataActionInterface => {
    return {
        type:"UPDATELINE",
        index,
        line
    }
}

export const deleteLine = (index: number): dataActionInterface => {
    return {
        type: "DELETELINE",
        index,
    }
}

export const loadSavedDataSuccess = (data: any[]): dataActionInterface => {
    return {
        type: "LOADSAVED",
        data,
    }
}

export const addMetadata = (colName: string, index: number, metadata: any[]): dataActionInterface => {
    return {
         type: "ADDMETA",
         colName, 
         index, 
         metadata,
    }

}

export const addAllMetaData = (responseMeta: metaResponseInterface): addAllMetaActionInterface => {
    return ({
        type: "ADDALLMETA",
        responseMeta,
    })
}

export const extendColMeta = (colName: string, reconciliator: string): dataActionInterface => {
    return {
        type: "EXTENDMETA",
        colName,
        reconciliator,
    }
}