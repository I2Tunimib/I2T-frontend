import style from "./ExtendModal.module.scss";
import { Dropdown, Form, Modal } from "react-bootstrap";
import React from "react";
import { classicModalPropsInterface } from "../../Interfaces/classic-modal-props.interface";
import { useSelector } from "react-redux";
import MainButton from "../MainButton/MainButton";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import { RootState } from "../../Redux/store";
import DropdownMenu from "react-bootstrap/esm/DropdownMenu";
import { configInterface, extensionServiceInterface, inputModeEnum } from "../../Interfaces/configInterface";
import produce from "immer";

const ExtendModal = (props: classicModalPropsInterface) => {
    const { titleText, text, mainButtonLabel, mainButtonAction, secondaryButtonLabel, secondaryButtonAction, showState, onClose } = props;
    const [show, setShow] = React.useState(true);
    const Config = useSelector((state: RootState) => state.Config);
    const [extendService, setExtendService] = React.useState<extensionServiceInterface | null>(null);
    const [paramsToSend, setParamsToSend] = React.useState<any>({});
    const [markup, setMarkup] = React.useState<any[]>([]);
    const Columns = useSelector((state: RootState) => state.Columns);

    React.useEffect(() => {
        setShow(showState);
    }, [showState])

    React.useEffect(() => {
        if (show === false) {
            onClose();
        }
    }, [show])

    React.useEffect(() => {
        console.log(paramsToSend)
    },[paramsToSend])

    const dropServiceItems = Config!.extensionServices.map((service) => {
        return (
            <Dropdown.Item key={service.name} onClick={() => { setExtendService(service) }}>{service.name}</Dropdown.Item>
        )
    })

    React.useEffect(() => {
        if (extendService) {
            requiredInput();
        }
    }, [extendService])

    const requiredInput = () => {
        const myMarkup: any[] = [];
        for (const param of extendService!.requiredParams) {
            if (param.userManual === true) {
                switch (param.inputMode) {
                    case inputModeEnum.SELECT_COL:
                        myMarkup.push(
                            <div className={style.fieldContainer} key={param.name}>
                                <Form.Group>
                                    <Form.Label>
                                        {param.name}
                                    </Form.Label>
                                    <Form.Control as="select" onChange={(e) => {
                                        const newParamsToSend = JSON.parse(JSON.stringify(paramsToSend));
                                        newParamsToSend[param.name] = e.target.value;
                                        setParamsToSend(newParamsToSend);
                                    }}>
                                        {Columns.map((col) => {
                                            return (
                                                <option value={col.name} key={col.name}>
                                                    {col.name}
                                                </option>
                                            )
                                        })}
                                    </Form.Control>
                                </Form.Group>
                            </div>

                        )
                        break;
                    case inputModeEnum.CHECKBOXES:
                        myMarkup.push(
                            <div className={style.fieldContainer}>
                                {param.values!.map((value) => {
                                    return (
                                        <div key={value.label}>
                                            <Form.Check
                                                type="checkbox"
                                                label={value.label}
                                            
                                                onChange={(e) => {
                                                   let newParamValues = paramsToSend[param.name];
                                                   if(e.target.checked) {
                                                       if(newParamValues === undefined) {
                                                           newParamValues = [];
                                                       }
                                                       newParamValues.push(value.value);
                                                   }
                                                   console.log()
                                                   const newParamsToSend = JSON.parse(JSON.stringify(paramsToSend));
                                                   newParamsToSend[param.name]= newParamValues;
                                                   setParamsToSend(newParamsToSend);
                                                }}
                                            />

                                        </div>
                                    )
                                })}
                            </div>
                        )
                }
            }
        }
        setMarkup(myMarkup)
    }

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
                            <Form>
                                {markup}
                            </Form>
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
                            <MainButton cta={() => { console.log(paramsToSend) }} label={mainButtonLabel} />
                        }


                    </Modal.Footer>
                </Modal>

            </>
        </>
    )
}

export default ExtendModal;