export const reconciliate = (payload) => {
    return({
        type: "RECONCILIATE",
        payload
    })
}

export const noReconciliate = () => {
    return ({
        type: "NORECONCILIATE",
    })
}