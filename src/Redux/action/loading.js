export const setLoadingState = () => {
    console.log("loading");
    return {
        type: "LOADING",
    }
}

export const unsetLoadingState = () => { 
    console.log("not loading");
     return {
         type: "NOT LOADING",
     }
}