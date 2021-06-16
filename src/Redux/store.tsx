import { createStore, compose } from "redux";
import allReducers from "./reducer/index";
import { configureStore } from '@reduxjs/toolkit';

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
    }
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;


const loadState = () => {
    try {
        const serializedState = localStorage.getItem("state");
        if (serializedState === null) {
            return undefined
        }
        return (JSON.parse(serializedState));
    }
    catch {
        return undefined;
    }
}

const persistentState = loadState();

const store = createStore(allReducers,
    persistentState,
    composeEnhancers());

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

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch