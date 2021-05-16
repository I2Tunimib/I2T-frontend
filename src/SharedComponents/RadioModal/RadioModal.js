import {Modal, Form } from "react-bootstrap";
import MainButton from "../MainButton/MainButton";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import React from "react";


const RadioModal = (props) => {
    const {inputArray, titleText, text, mainButtonLabel, mainButtonAction, secondaryButtonLabel, secondaryButtonAction, showState, onClose, setInputValue } = props;
    const [show, setShow] = React.useState(true);


    React.useEffect(() => {
        setShow(showState);
    }, [showState])

    React.useEffect(() => {
        if (show === false && typeof onClose === "function") {
            onClose();
        }
    }, [show])

    const radioFiels = inputArray.map((item)=>{
        return(
            <Form.Check 
            type={"radio"} 
            key={item.value} 
            label={item.label} 
            name={"city"}
            value={item.value}
            id={item.value}
            onChange={(e) => {setInputValue(e.target.value)}}/>

        )
    })



    return (
        <>
            <Modal show={show} onHide={() => { setShow(false) }}>
                <Modal.Header closeButton>
                    <Modal.Title>{titleText}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {text}
                    <Form>
                        {radioFiels}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    {
                        secondaryButtonLabel && secondaryButtonAction &&
                        <SecondaryButton cta={secondaryButtonAction} label={secondaryButtonLabel} />
                    }
                    {
                        mainButtonLabel && mainButtonAction &&
                        <MainButton cta={mainButtonAction} label={mainButtonLabel} />
                    }


                </Modal.Footer>
            </Modal>

        </>
    )
}
export default RadioModal;