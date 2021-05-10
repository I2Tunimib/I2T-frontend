import {Button} from "react-bootstrap";
import style from "./MainButton.module.css";


function MainButton(props) {
    const {label, disabled} = props;

    return( 
        <Button onClick={(e) => props.cta()} className={style.button} disabled={disabled}>
            {label}
        </Button>
    )
}

export default MainButton;