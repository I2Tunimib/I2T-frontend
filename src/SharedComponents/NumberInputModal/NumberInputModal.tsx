import { Modal, Form } from "react-bootstrap";
import MainButton from "../MainButton/MainButton";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import React from "react";
import Slider from '@material-ui/core/Slider';


const NumberInputModal = (props: any) => {
    const { inputLabel, titleText, text, minMax, value, mainButtonLabel, mainButtonAction, secondaryButtonLabel, secondaryButtonAction, showState, onClose, setInputValue } = props;
    const [show, setShow] = React.useState(true);


    React.useEffect(() => {
        setShow(showState);
    }, [showState])

    React.useEffect(() => {
        if (show === false && typeof onClose === "function") {
            onClose();
        }
    }, [show])

    React.useEffect(() => {
        setInputValue(value);
    },[])

    const marks = [
        {
          value: minMax.min,
          label: minMax.min.toString().substring(0,5),
        },
        {
          value: minMax.max,
          label: minMax.max.toString().substring(0,5),
        },
        {
            value: value, 
            label: value.toString().substring(0,5)
        }
      ];



    return (
        <>
            <Modal show={show} onHide={() => { setShow(false) }}>
                <Modal.Header closeButton>
                    <Modal.Title>{titleText}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {text}
                    <Form>
                        {/*
                            <Form.Group>
                                <Form.Label>{inputLabel}</Form.Label>
                                <Form.Control type="number" onChange={(e) => { setInputValue(e.target.value) }} defaultValue={value} />
                            </Form.Group>*/
                        }
                        <Slider min={minMax.min}  marks={marks} max={minMax.max} aria-labelledby="discrete-slider" onChange={(e, value) => { setInputValue(value) }}/>
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
export default NumberInputModal;