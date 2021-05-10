import {Button} from "react-bootstrap";
import style from "./SecondaryButton.module.css";


function SecondaryButton(props) {
    const {label, disabled} = props;

    return( 
        <Button onClick={(e) => props.cta()} className={style.button} disabled={disabled}>
            {label}
        </Button>
    )
}

export default SecondaryButton;