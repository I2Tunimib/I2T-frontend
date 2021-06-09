import React from "react";
import {useDispatch} from "react-redux";
import { deleteData} from "../../Redux/action/loadDataSuccess";
import {deleteName} from "../../Redux/action/loadName";
import {hasNotExtended} from "../../Redux/action/hasExtended";
import {removeAllToExtendRows} from "../../Redux/action/toExtendRows";
import {unsetLoadingState} from "../../Redux/action/loading";
import { removeEditableCell } from "../../Redux/action/editableCell";
import {deleteAllColumns} from "../../Redux/action/loadColumns";
import {extendedRow} from "../../Redux/action/extendRow";
import {getReconciliators} from "../../Redux/action/getRiconciliators";
import {getAllReconciliator} from "../../Http/httpServices";
import {displayError} from "../../Redux/action/error";
import {noReconciliate} from "../../Redux/action/reconciliate";

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

    const getReconciliatorsDispatcher = (reconciliators) => {
        dispatch(getReconciliators(reconciliators));
    }

    const dispatchError = (err) =>{
        dispatch(displayError(err))
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
        (async ()=>{
            const respReconciliators = await getAllReconciliator();
            if (respReconciliators.status === 200) {
                const reconciliators = respReconciliators.data.reconciliators;
                getReconciliatorsDispatcher(reconciliators);
            } else {
                dispatchError('Impossible to connect to riconciliator service.');
            }
        })()
    }, [])
    return(
        <>
        </>
    )
}

export default InitialEffect;