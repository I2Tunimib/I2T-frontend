import {Button} from "react-bootstrap";
import style from "./SecondaryButton.module.css";


function SecondaryButton(props) {
    const {label} = props;

    return( 
        <Button onClick={(e) => props.cta()} className={style.button}>
            {label}
        </Button>
    )
}

export default SecondaryButton;