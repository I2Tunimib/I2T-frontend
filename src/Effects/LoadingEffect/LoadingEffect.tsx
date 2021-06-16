import {useSelector} from "react-redux";
import React from "react";
import LoadingSpinner from "../../SharedComponents/LoadingSpinner/LoadingSpinner";
import { RootState } from "../../Redux/store";


const LoadingEffect = () => {
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