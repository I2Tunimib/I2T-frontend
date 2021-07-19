import { combineReducers } from "redux";
import {errorHandlerReducer} from "./errorReducer";
import { loadDataSuccessReducer } from "./dataReducer";
import loadingReducer from "./loadingReducer";
import nameLoadReducer from "./nameReducer"
import columnsReducer from "./columnsReducer";
import contextReducer from "./contextMenuReducer";
import reconciliateReducer from "./reconciliateReducer";
import filterDataReducer from "./filerDataReducer";
import configReducer from "./configReducer";
import languageReducer from "./languageReducer";


const allReducers = combineReducers({
    Language: languageReducer,
    Error: errorHandlerReducer,
    LoadingState: loadingReducer,
    Data: loadDataSuccessReducer,
    Name: nameLoadReducer,
    Columns: columnsReducer,
    Context: contextReducer,
    Config: configReducer,
    ItemsToReconciliate: reconciliateReducer,
    FilteredData: filterDataReducer

})

export default allReducers;