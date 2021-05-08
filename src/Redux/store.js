import {createStore} from "redux";
import allReducers from "./reducer/index";
const loadState = () => {
    try{
        const serializedState = localStorage.getItem("state");
        if(serializedState === null) {
            return undefined
        }
        return (JSON.parse(serializedState));
    }
    catch{
        return undefined;
    }
}

const persistentState = loadState();

const store = createStore(allReducers,
    persistentState,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

const saveState = () => {
    const state = store.getState();
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('state', serializedState);
    }
    catch {
        // ignore
    }
}

store.subscribe(saveState);

export default store;