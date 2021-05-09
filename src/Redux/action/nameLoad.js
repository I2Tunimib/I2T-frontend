export const loadName = (name) => {
    return {
        type: "LOADNAME",
        name
    }
}

export const deleteName = () => {
    return {
        type: "DELETENAME",
    }
}