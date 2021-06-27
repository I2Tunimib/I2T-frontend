const configReducer = (state: null | any = null, action: {type: string, configData: any} ) => {
    switch(action.type) {
        case "GETCONFIG":
             return state = action.configData;
        default:
            return state;
    }
}

export default configReducer;