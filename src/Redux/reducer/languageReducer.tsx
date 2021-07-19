const languageReducer = (state = 'en', action: {type: string, lang: string} ) => {
    switch(action.type) {
        case "SETLANGUAGE":
            return state = action.lang;
        default: 
            return state;
    }
}

export default languageReducer;