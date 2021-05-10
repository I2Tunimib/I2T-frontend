import { combineReducers } from "redux";
import {errorHandlerReducer} from "./errorHandler";
import { loadDataSuccessReducer } from "./loadDataSuccessReducer";
import loadingReducer from "./loadingReducer";
import nameLoadReducer from "./nameLoadReducer"
import loadColumnsReducer from "./loadColumnsReducer";



const allReducers = combineReducers({
    ErrorHandler: errorHandlerReducer,
    Loading: loadingReducer,
    LoadedData: loadDataSuccessReducer,
    LoadedName: nameLoadReducer,
    LoadedColumns: loadColumnsReducer
})

export default allReducers;