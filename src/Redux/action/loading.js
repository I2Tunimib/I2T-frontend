export const setLoadingState = () => {
    return {
        type: "LOADING",
    }
}

export const unsetLoadingState = () => { 
     return {
         type: "NOT LOADING",
     }
}