import { combineReducers } from "redux";
import {errorHandlerReducer} from "./errorReducer";
import { loadDataSuccessReducer } from "./dataReducer";
import loadingReducer from "./loadingReducer";
import nameLoadReducer from "./nameReducer"
import loadColumnsReducer from "./loadColumnsReducer";
import contextReducer from "./contextMenuReducer";
import hasExtendedReducer from "./hasExtendedReducer";
import toExtendRowsReducer from "./toExtendRowsReducer";
import editableCellReducer from "./editableCellReducer";
import extendRowReducer from "./extendRowReducer";
import getReconciliatorsReducer from "./getReconciliatorsReducer";
import reconciliateReducer from "./reconciliateReducer";
import store from "../store";


const allReducers = combineReducers({
    Error: errorHandlerReducer,
    LoadingState: loadingReducer,
    Data: loadDataSuccessReducer,
    Name: nameLoadReducer,
    Columns: loadColumnsReducer,
    Context: contextReducer,
    // HasExtended: hasExtendedReducer, 
    // ToExtendRows: toExtendRowsReducer,
    EditableCell: editableCellReducer,
    // ExtendRow: extendRowReducer,
    Reconciliators: getReconciliatorsReducer,
    ItemsToReconciliate: reconciliateReducer,
})

export default allReducers;