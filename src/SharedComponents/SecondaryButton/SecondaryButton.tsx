import {Button} from "react-bootstrap";
import { buttonsPropsInterface } from "../../Interfaces/buttons-props.interface";
import style from "./SecondaryButton.module.css";


function SecondaryButton(props: buttonsPropsInterface) {
    const {label, disabled, cta} = props;

    return( 
        <Button onClick={(e) => cta()} className='secondary-button' disabled={disabled}>
            {label}
        </Button>
    )
}

export default SecondaryButton;