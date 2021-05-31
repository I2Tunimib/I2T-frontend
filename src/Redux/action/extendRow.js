export const extendRow = (rowIndex) => {
    return ({
        type: "EXTENDROW",
        rowIndex,
    })
}

export const extendedRow = () => {
    return ({
        type: "ROWHASBEENEXTENDED"
    })
}