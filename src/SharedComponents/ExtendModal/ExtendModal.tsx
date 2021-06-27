import style from "./ExtendModal.module.scss";
import { Dropdown, Modal } from "react-bootstrap";
import React from "react";
import { classicModalPropsInterface } from "../../Interfaces/classic-modal-props.interface";
import { useSelector } from "react-redux";
import MainButton from "../MainButton/MainButton";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import { RootState } from "../../Redux/store";
import DropdownMenu from "react-bootstrap/esm/DropdownMenu";
import { configInterface, extensionServiceInterface } from "../../Interfaces/configInterface";

const ExtendModal = (props: classicModalPropsInterface) => {
    const { titleText, text, mainButtonLabel, mainButtonAction, secondaryButtonLabel, secondaryButtonAction, showState, onClose } = props;
    const [show, setShow] = React.useState(true);
    const Config = useSelector((state: RootState) => state.Config);
    const [extendService, setExtendService] = React.useState<extensionServiceInterface | null>(null);

    React.useEffect(() => {
        setShow(showState);
    }, [showState])

    React.useEffect(() => {
        if (show === false) {
            onClose();
        }
    }, [show])

    const dropServiceItems = Config!.extensionServices.map((service) => {
        return (
            <Dropdown.Item key={service.name} onClick={() => { setExtendService(service) }}>{service.name}</Dropdown.Item>
        )
    })

    return (
        <>
            <>
                <Modal show={show} onHide={() => { setShow(false) }} className={props.metadataModal ? style.metadataModal : undefined}>
                    <Modal.Header closeButton>
                        <Modal.Title>{titleText}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {text}

                        <Dropdown className={style.dropdown}>
                            <Dropdown.Toggle variant="primary" id="dropdown-basic">
                                {extendService ? extendService!.name : 'Scegli un servizio'}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                {dropServiceItems}
                            </Dropdown.Menu>
                        </Dropdown>
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
        </>
    )
}

export default ExtendModal;