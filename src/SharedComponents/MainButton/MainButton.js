import {Button} from "react-bootstrap";
import style from "./MainButton.module.css";


function MainButton(props) {
    const {label} = props;

    return( 
        <Button onClick={(e) => props.cta()} className={style.button}>
            {label}
        </Button>
    )
}

export default MainButton;