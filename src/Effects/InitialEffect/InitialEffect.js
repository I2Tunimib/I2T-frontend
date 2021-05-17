import React from "react";
import {useDispatch} from "react-redux";
import { deleteData} from "../../Redux/action/loadDataSuccess";
import {deleteName} from "../../Redux/action/loadName";
import {hasNotExtended} from "../../Redux/action/hasExtended";
import {removeAllToExtendCols} from "../../Redux/action/toExtendCols";
import {unsetLoadingState} from "../../Redux/action/loading";
import { removeEditableCell } from "../../Redux/action/editableCell";
import {deleteAllColumns} from "../../Redux/action/loadColumns";

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
    const dispatchRemoveToExtend = () => {
        dispatch(removeAllToExtendCols())
    }
    const dispatchNoLoadingState = () => {
        dispatch(unsetLoadingState());
    }

    const dispatchNoToExtendCol = ()=> {
        dispatch(removeAllToExtendCols());
    }

    const dispatchDeleteAllCols = () => {
        dispatch(deleteAllColumns());
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
    }, [])
    return(
        <>
        </>
    )
}

export default InitialEffect;