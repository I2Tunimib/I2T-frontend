export const displayError = (error) => {
    return {
        type: "ERROR",
        error,
    }
}

export const noError = () => {
    return {
        type: "NOERROR",
    }
}