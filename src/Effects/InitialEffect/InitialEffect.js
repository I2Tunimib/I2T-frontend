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

const InitialEffect = () => {
    const dispatch = useDispatch();

    const dispatchRemoveEditableCell = () => {
        dispatch(removeEditableCell())
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
    }, [])
    return(
        <>
        </>
    )
}

export default InitialEffect;