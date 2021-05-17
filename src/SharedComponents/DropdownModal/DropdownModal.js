import MainButton from "../MainButton/MainButton";
import style from "./DropdownModal.module.css";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import { DropdownButton, Dropdown, Modal } from "react-bootstrap";
import React from "react";

const DropdownModal = (props) => {
    const { inputLabel, titleText, text, mainButtonLabel, mainButtonAction, secondaryButtonLabel, secondaryButtonAction, showState, onClose, inputValues, setInputValue } = props;
    const [show, setShow] = React.useState(true);
    const [dropValue, setDropValue] = React.useState("");

    React.useEffect(() => {
        setInputValue(dropValue);
    }, [dropValue])


    React.useEffect(() => {
        setShow(showState);
    }, [showState])

    React.useEffect(() => {
        if (show === false && typeof onClose === "function") {
            onClose();
        }
    }, [show])


    const dropdownItems = inputValues.map((item) => {
        return (
            <Dropdown.Item key={item.value} onClick={(e) => { setDropValue(item) }}>{item.label}</Dropdown.Item>
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

                    <Dropdown className={style.dropdown}>
                        <Dropdown.Toggle variant="primary" id="dropdown-basic">
                            {dropValue.label || inputLabel}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            {dropdownItems}
                        </Dropdown.Menu>
                    </Dropdown>
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

export default DropdownModal;