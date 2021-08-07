import MainButton from "../MainButton/MainButton";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import { Dropdown, Modal } from "react-bootstrap";
import React from "react";
import { dropdownModalPropsInterface } from "../../Interfaces/dropdown-modal-props.interface";
import HelpModal from "../HelpModal/HelpModal";

const DropdownModal = (props: dropdownModalPropsInterface) => {
    const { help, inputLabel, titleText, text, mainButtonLabel, mainButtonAction, secondaryButtonLabel, secondaryButtonAction, showState, onClose, inputValues, setInputValue } = props;
    const [show, setShow] = React.useState(true);
    const [dropValue, setDropValue] = React.useState<{ label: string, value: string }>();

    React.useEffect(() => {
        setInputValue(dropValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dropValue])


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


    const dropdownItems = inputValues.map((item) => {
        return (
            <Dropdown.Item key={item.value} onClick={(e) => { setDropValue(item) }}>{item.label}</Dropdown.Item>
        )
    })


    return (
        <>
            <Modal show={show} onHide={() => { setShow(false) }}>
                <Modal.Header closeButton>
                    <Modal.Title><h3>{titleText}</h3></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{text}</p>
                    <div className='help-drop-container'>
                        <Dropdown>
                            <Dropdown.Toggle variant="primary" id="dropdown-basic">
                                {dropValue ? dropValue!.label : inputLabel}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                {dropdownItems}
                            </Dropdown.Menu>
                        </Dropdown>
                        <HelpModal />
                    </div>
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