import { Modal, Form } from "react-bootstrap";
import MainButton from "../MainButton/MainButton";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import React from "react";
import Slider from '@material-ui/core/Slider';


const NumberInputModal = (props: any) => {
    const { titleText, text, minMax, value, mainButtonLabel, mainButtonAction, secondaryButtonLabel, secondaryButtonAction, showState, onClose, setInputValue } = props;
    const [show, setShow] = React.useState(true);
    //console.log(value);

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

    React.useEffect(() => {
        setInputValue(value);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const marks = [
        {
            value: minMax.min,
            label: minMax.min.toString().substring(0, 5),
        },
        {
            value: minMax.max,
            label: minMax.max.toString().substring(0, 5),
        },
        {
            value: value,
            label: value.toString().substring(0, 5)
        }
    ];



    return (
        <>
            <Modal show={show} onHide={() => { setShow(false) }} className='number-input-modal'>
                <Modal.Header closeButton>
                    <Modal.Title><h3>{titleText}</h3></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        {text}
                    </p>

                        {/*
                            <Form.Group>
                                <Form.Label>{inputLabel}</Form.Label>
                                <Form.Control type="number" onChange={(e) => { setInputValue(e.target.value) }} defaultValue={value} />
                            </Form.Group>*/
                        }
                        <Slider min={minMax.min} marks={marks} max={minMax.max} value={value} aria-labelledby="discrete-slider" onChange={(e, value) => {console.log(value); e.preventDefault(); setInputValue(value) }} />
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