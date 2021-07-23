import { Modal, Form } from "react-bootstrap";
import MainButton from "../MainButton/MainButton";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import React from "react";
import { inputModalPropsInterface } from "../../Interfaces/input-modal-props.interface";


const InputModal = (props: inputModalPropsInterface) => {
    const { inputLabel, titleText, text, value, mainButtonLabel, mainButtonAction, secondaryButtonLabel, secondaryButtonAction, showState, onClose, setInputValue } = props;
    const [show, setShow] = React.useState(true);


    React.useEffect(() => {
        setShow(showState);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showState])

    React.useEffect(() => {
        if (show === false && typeof onClose === "function") {
            onClose();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show])



    return (
        <>
            <Modal show={show} onHide={() => { setShow(false) }} className='modal'>
                <Modal.Header closeButton>
                    <Modal.Title><h3>{titleText}</h3></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {text}
                    <Form>
                        <Form.Group>
                            <Form.Label>{inputLabel}</Form.Label>
                            <Form.Control type="text" onChange={(e) => {setInputValue(e.target.value)}} defaultValue={value}/>
                        </Form.Group>
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
export default InputModal;