import {useSelector} from "react-redux";
import React from "react";
import LoadingSpinner from "../../SharedComponents/LoadingSpinner/LoadingSpinner";
import { RootState } from "../../Redux/store";


const LoadingEffect = () => {

    // loadingEffect listen for LoadingState part of the state.
    // if it is set on true, it show a loading spinner
    const loadingState = useSelector((state: RootState) => state.LoadingState);

    React.useEffect(()=>{
        if (loadingState) {
            window.scrollTo(0, 0);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "scroll";
        }
    }, [loadingState])
    

    return(
        <>
        {
            loadingState && 
            <LoadingSpinner/>
        }
        </>
    )
}

export default LoadingEffect;