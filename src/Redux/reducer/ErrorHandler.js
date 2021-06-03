export const errorHandlerReducer = (state = false, action) => {
    const error = action.error; 
    console.log(action);
    switch(action.type) {
        case "ERROR":
            return state = error || 'Unknown error';
        case "NOERROR":
            return state = false;
        default:
            return state;
    }
}
