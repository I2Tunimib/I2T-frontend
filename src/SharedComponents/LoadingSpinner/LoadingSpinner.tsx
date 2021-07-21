import {Spinner} from "react-bootstrap";

const LoadingSpinner = () => {
    return(
        <div className='overlay'>
            <Spinner animation="border" variant="info" />
        </div>
    )

}

export default LoadingSpinner;