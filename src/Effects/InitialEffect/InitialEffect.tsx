import React from "react";
import {useDispatch} from "react-redux";
import { deleteData} from "../../Redux/action/data";
import {deleteName} from "../../Redux/action/name";
import {unsetLoadingState} from "../../Redux/action/loading";
import {deleteAllColumns} from "../../Redux/action/columns";
import {getConfig} from "../../Http/httpServices";
import {displayError} from "../../Redux/action/error";
import {noReconciliate} from "../../Redux/action/reconciliate";
import { removeContext } from "../../Redux/action/contextMenu";
import { getConfigData } from "../../Redux/action/config";

const InitialEffect = () => {
    const dispatch = useDispatch();

    const dispatchNoReconciliate = () => {
        dispatch(noReconciliate())
    }

    const dispatchDeleteData = () => {
        dispatch(deleteData());
    }
    const dispatchDeleteName = () => {
        dispatch(deleteName());
    }
    
    const dispatchNoLoadingState = () => {
        dispatch(unsetLoadingState());
    }

    const dispatchDeleteAllCols = () => {
        dispatch(deleteAllColumns());
    }

    const getConfigDispatcher = (configData: any) => {
        dispatch(getConfigData(configData));
    }

    const dispatchError = (err: string) =>{
        dispatch(displayError(err))
    }

    const dispatchRemoveContext = () => {
        dispatch(removeContext());
    }

    // on init cancel all data
    React.useEffect(()=>{
        dispatchNoLoadingState();
        dispatchDeleteData();
        dispatchDeleteName();
        dispatchDeleteAllCols();
        dispatchNoReconciliate();
        dispatchRemoveContext();
        (async ()=>{
            const respConfig = await getConfig();
            if (respConfig.error) {
                dispatchError(respConfig.errorText);
            } else {
                const configData = respConfig.data;
                getConfigDispatcher(configData);
            }
        })()
    }, [])
    return(
        <>
        </>
    )
}

export default InitialEffect;