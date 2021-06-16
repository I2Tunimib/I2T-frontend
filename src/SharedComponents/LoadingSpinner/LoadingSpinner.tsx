import {Spinner} from "react-bootstrap";
import style from "./LoadingSpinner.module.css";

const LoadingSpinner = () => {
    return(
        <div className={style.backOverlay}>
            <Spinner animation="border" variant="info" />
        </div>
    )

}

export default LoadingSpinner;