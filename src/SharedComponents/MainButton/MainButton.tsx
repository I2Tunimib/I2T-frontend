import {Button} from "react-bootstrap";
import { buttonsPropsInterface } from "../../Interfaces/buttons-props.interface";
import style from "./MainButton.module.css";


function MainButton(props: buttonsPropsInterface) {
    const {label, disabled, cta} = props;

    return( 
        <Button onClick={(e) => cta()} className={style.button} disabled={disabled}>
            {label}
        </Button>
    )
}

export default MainButton;