import { combineReducers } from "redux";
import {errorHandlerReducer} from "./errorHandler";
import { loadDataSuccessReducer } from "./loadDataSuccessReducer";
import loadingReducer from "./loadingReducer";
import nameLoadReducer from "./nameLoadReducer"
import loadColumnsReducer from "./loadColumnsReducer";
import contextReducer from "./contextReducer";
import hasExtendedReducer from "./hasExtendedReducer";
import toExtendRowsReducer from "./toExtendRowsReducer";
import editableCellReducer from "./editableCellReducer";
import extendRowReducer from "./extendRowReducer";
import getReconciliatorsReducer from "./getReconciliatorsReducer";
import reconciliateReducer from "./reconciliateReducer";


const allReducers = combineReducers({
    ErrorHandler: errorHandlerReducer,
    Loading: loadingReducer,
    LoadedData: loadDataSuccessReducer,
    LoadedName: nameLoadReducer,
    LoadedColumns: loadColumnsReducer,
    OpenedContext: contextReducer,
    HasExtended: hasExtendedReducer, 
    ToExtendRows: toExtendRowsReducer,
    EditableCell: editableCellReducer,
    ExtendRow: extendRowReducer,
    Reconciliators: getReconciliatorsReducer,
    ItemsToReconciliate: reconciliateReducer,
})

export default allReducers;