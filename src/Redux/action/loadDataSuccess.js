export const loadDataSuccess = (data) => {
    return {
        type: "LOADED",
        data,
    }
}
export const deleteData = () => {
    return{
        type:"CANCELDATA"
    }
}