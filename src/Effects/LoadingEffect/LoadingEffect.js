import {useSelector} from "react-redux";
import React from "react";
import LoadingSpinner from "../../SharedComponents/LoadingSpinner/LoadingSpinner";


const LoadingEffect = () => {
    const loadingState = useSelector(state => state.Loading);

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