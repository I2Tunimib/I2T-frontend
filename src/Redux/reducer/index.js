import { combineReducers } from "redux";
import {errorHandlerReducer} from "./errorHandler";
import { loadDataSuccessReducer } from "./loadDataSuccessReducer";
import loadingReducer from "./loadingReducer";
import nameLoadReducer from "./nameLoadReducer"
import loadColumnsReducer from "./loadColumnsReducer";
import contextReducer from "./contextReducer";
import hasExtendedReducer from "./hasExtendedReducer";
import toExtendColsReducer from "./toExtendColsReducer";



const allReducers = combineReducers({
    ErrorHandler: errorHandlerReducer,
    Loading: loadingReducer,
    LoadedData: loadDataSuccessReducer,
    LoadedName: nameLoadReducer,
    LoadedColumns: loadColumnsReducer,
    OpenedContext: contextReducer,
    HasExtended: hasExtendedReducer, 
    ToExtendCols: toExtendColsReducer,
})

export default allReducers;