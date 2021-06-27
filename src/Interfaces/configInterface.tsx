export enum inputModeEnum {
    SELECTED_COL = "selectedCol",
    SELECT_COl = "selectCol",
    CHECKBOXES = "checkboxes",
}

export interface reconciliatorInterface {
    name: string,
    relativeUrl: string,
    entityPageUrl: string | null,
    metaToViz: string[]
}

export interface extensionServiceInterface {
     name: string,
        relativeUrl: string;
        requiredParams: {
            name: string,
            userManual: boolean,
            inputMode: inputModeEnum,
            values?: {
                label: string,
                value: string,
                responseValues: string[]
            }
            
        }[],
        responseParamsForItem: {
            id: string,
            date: string,
        }
}

export interface configInterface {
    reconciliators: reconciliatorInterface[],
    extensionServices: extensionServiceInterface[]

}