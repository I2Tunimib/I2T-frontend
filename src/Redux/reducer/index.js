import { combineReducers } from "redux";
import {ErrorHandlerReducer} from "./ErrorHandler";


const allReducers = combineReducers({
    ErrorHandler: ErrorHandlerReducer,
})

export default allReducers;