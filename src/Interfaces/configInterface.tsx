export enum inputModeEnum {
    SELECTED_COL = "selectedCol",
    SELECT_COL = "selectCol",
    ENUMERATION = "enumeration",
    NUMBER = "number"
}

export enum selectColModeEnum {
    IDS = 'ids',
    LABELS = 'labels'
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
            inputMode: inputModeEnum,
            selectColMode?: selectColModeEnum,
            required?: boolean,
            default?: any,
            isMatchingParam: boolean
            values?: {
                label: string,
                value: string,
                responseValues?: string[]
            }[]
        }[],
        responseParamsToMatch: string[];
}

export interface configInterface {
    reconciliators: reconciliatorInterface[],
    extensionServices: extensionServiceInterface[]

}