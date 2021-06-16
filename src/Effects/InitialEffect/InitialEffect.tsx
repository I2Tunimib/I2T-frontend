import React from "react";
import {useDispatch} from "react-redux";
import { deleteData} from "../../Redux/action/data";
import {deleteName} from "../../Redux/action/name";
import {hasNotExtended} from "../../Redux/action/hasExtended";
import {removeAllToExtendRows} from "../../Redux/action/toExtendRows";
import {unsetLoadingState} from "../../Redux/action/loading";
import { removeEditableCell } from "../../Redux/action/editableCell";
import {deleteAllColumns} from "../../Redux/action/columns";
import {extendedRow} from "../../Redux/action/extendRow";
import {getReconciliators} from "../../Redux/action/getRiconciliators";
import {getAllReconciliator} from "../../Http/httpServices";
import {displayError} from "../../Redux/action/error";
import {noReconciliate} from "../../Redux/action/reconciliate";
import { removeContext } from "../../Redux/action/contextMenu";
import { reconciliatorInterface } from "../../Interfaces/reconciliator.interface";

const InitialEffect = () => {
    const dispatch = useDispatch();

    const dispatchRemoveEditableCell = () => {
        dispatch(removeEditableCell())
    }

    const dispatchNoReconciliate = () => {
        dispatch(noReconciliate())
    }

    const dispatchDeleteData = () => {
        dispatch(deleteData());
    }
    const dispatchDeleteName = () => {
        dispatch(deleteName());
    }
    const dispatchHasNotExtended = () => {
        dispatch(hasNotExtended());
    }
    
    const dispatchNoLoadingState = () => {
        dispatch(unsetLoadingState());
    }

    const dispatchNoToExtendCol = ()=> {
        dispatch(removeAllToExtendRows());
    }

    const dispatchDeleteAllCols = () => {
        dispatch(deleteAllColumns());
    }

    const dispatchNoExtendRow = () => {
        dispatch(extendedRow());
    }

    const getReconciliatorsDispatcher = (reconciliators: reconciliatorInterface[]) => {
        dispatch(getReconciliators(reconciliators));
    }

    const dispatchError = (err: string) =>{
        dispatch(displayError(err))
    }

    const dispatchRemoveContext = () => {
        dispatch(removeContext());
    }

    // on init cancel all data
    React.useEffect(()=>{
        dispatchNoToExtendCol();
        dispatchNoLoadingState();
        dispatchDeleteData();
        dispatchDeleteName();
        dispatchHasNotExtended();
        dispatchRemoveEditableCell();
        dispatchDeleteAllCols();
        dispatchNoExtendRow();
        dispatchNoReconciliate();
        dispatchRemoveContext();
        (async ()=>{
            const respReconciliators = await getAllReconciliator();
            if (respReconciliators.error) {
                dispatchError('Impossible to connect to riconciliator service.');
            } else {
                const reconciliators = respReconciliators.data.reconciliators;
                getReconciliatorsDispatcher(reconciliators);
            }
        })()
    }, [])
    return(
        <>
        </>
    )
}

export default InitialEffect;