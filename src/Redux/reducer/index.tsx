import { combineReducers } from "redux";
import {errorHandlerReducer} from "./errorReducer";
import { loadDataSuccessReducer } from "./dataReducer";
import loadingReducer from "./loadingReducer";
import nameLoadReducer from "./nameReducer"
import loadColumnsReducer from "./loadColumnsReducer";
import contextReducer from "./contextMenuReducer";
import editableCellReducer from "./editableCellReducer";
import reconciliateReducer from "./reconciliateReducer";
import filterDataReducer from "./filerDataReducer";
import configReducer from "./configReducer";


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
    Config: configReducer,
    ItemsToReconciliate: reconciliateReducer,
    FilteredData: filterDataReducer

})

export default allReducers;