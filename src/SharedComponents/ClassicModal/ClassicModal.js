import { Modal } from "react-bootstrap";
import MainButton from "../MainButton/MainButton";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import React from "react";


const ClassicModal = (props) => {
    const { titleText, text, mainButtonLabel, mainButtonAction, secondaryButtonLabel, secondaryButtonAction, showState, onClose} = props;
    const [show, setShow] = React.useState(true);

    React.useEffect(()=>{
        setShow(showState);
    }, [showState])

    React.useEffect(() => {
        if(show === false && typeof onClose === "function") {
            onClose();
        }
    }, [show])



    return (
        <>
            <Modal show={show} onHide={()=>{setShow(false)}}>
                <Modal.Header closeButton>
                    <Modal.Title>{titleText}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{text}</Modal.Body>
                <Modal.Footer>
                    {
                        mainButtonLabel && mainButtonAction &&
                        <MainButton cta={mainButtonAction} label={mainButtonLabel}/>
                    }
                    {
                        secondaryButtonLabel && secondaryButtonAction &&
                        <SecondaryButton cta={secondaryButtonAction} label={secondaryButtonLabel}/>
                    }
                    
                </Modal.Footer>
            </Modal>

        </>
    )
}
export default ClassicModal;