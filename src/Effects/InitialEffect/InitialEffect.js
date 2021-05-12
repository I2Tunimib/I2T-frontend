import React from "react";
import {useDispatch} from "react-redux";
import { deleteData} from "../../Redux/action/loadDataSuccess";
import {deleteName} from "../../Redux/action/loadName";
import {hasNotExtended} from "../../Redux/action/hasExtended";

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
    // on init cancel all data
    React.useEffect(()=>{
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