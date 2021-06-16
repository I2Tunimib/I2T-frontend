import { Modal } from "react-bootstrap";
import MainButton from "../MainButton/MainButton";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import React from "react";
import style from "./ClassicModal.module.css";
import { classicModalPropsInterface } from "../../Interfaces/classic-modal-props.interface";


const ClassicModal = (props: classicModalPropsInterface) => {
    const { titleText, text, mainButtonLabel, mainButtonAction, secondaryButtonLabel, secondaryButtonAction, showState, onClose } = props;
    const [show, setShow] = React.useState(true);

    React.useEffect(() => {
        setShow(showState);
    }, [showState])

    React.useEffect(() => {
        if (show === false) {
            onClose();
        }
    }, [show])

    return (
        <>
            <Modal show={show} onHide={() => { setShow(false) }} className={props.metadataModal ? style.metadataModal : undefined}>
                <Modal.Header closeButton>
                    <Modal.Title>{titleText}</Modal.Title>
                </Modal.Header>
                <Modal.Body
                    className={props.metadataModal ? style.metadataText : undefined}>
                    {props.metadataModal &&
                        <pre>{text}</pre>
                    }
                    {!props.metadataModal &&
                        <p>{text}</p>
                    }
                </Modal.Body>
                <Modal.Footer>
                    {
                        secondaryButtonLabel && secondaryButtonAction &&
                        <SecondaryButton
                            cta={secondaryButtonAction}
                            label={secondaryButtonLabel} />

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
export default ClassicModal;