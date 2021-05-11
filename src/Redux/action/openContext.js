export const addContext = (contextData) => {
    return{
        type: "ADDCONTEXT",
        context: contextData,
    }
}

export const removeContext = () => {
    return {
        type: "REMOVECONTEXT",
    }
}