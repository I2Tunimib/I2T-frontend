import {Button} from "react-bootstrap";
import { buttonsPropsInterface } from "../../Interfaces/buttons-props.interface";


function MainButton(props: buttonsPropsInterface) {
    const {label, disabled, cta} = props;

    return( 
        <Button className='main-button' onClick={(e) => cta()} disabled={disabled}>
            {label}
        </Button>
    )
}

export default MainButton;