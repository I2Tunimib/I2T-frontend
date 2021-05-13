import React from "react";
import {useDispatch} from "react-redux";
import { deleteData} from "../../Redux/action/loadDataSuccess";
import {deleteName} from "../../Redux/action/loadName";
import {hasNotExtended} from "../../Redux/action/hasExtended";
import {removeAllToExtendCols} from "../../Redux/action/toExtendCols";
import {unsetLoadingState} from "../../Redux/action/loading";

const InitialEffect = () => {
    const dispatch = useDispatch();

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
    // on init cancel all data
    React.useEffect(()=>{
        dispatchNoLoadingState();
        dispatchDeleteData();
        dispatchDeleteName();
        dispatchHasNotExtended();
    }, [])
    return(
        <>
        </>
    )
}

export default InitialEffect;