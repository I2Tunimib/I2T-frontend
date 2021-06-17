import { Modal } from "react-bootstrap";
import style from "./MetaTableModal.module.scss";
import React from "react";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import MainButton from "../MainButton/MainButton";
import { metaTableModalPropsInterface } from "../../Interfaces/meta-table-modal-props.interface";
import MUIDataTable from "mui-datatables";
import { NetworkCellOutlined } from "@material-ui/icons";
import { Action } from "redux";
import { ReactComponent as DeleteIcon } from "../../Assets/icon-set/delete/trash.svg";
import { ReactComponent as SelectIcon } from "../../Assets/icon-set/selected/select.svg";
import { ReactComponent as DeselectIcon } from "../../Assets/icon-set/selected/select-empty.svg";
import { addMetadata } from "../../Redux/action/data";
import { useDispatch } from "react-redux";




export const MetaTableModal = (props: metaTableModalPropsInterface) => {
    const {
        titleText,
        metaData,
        dataIndex,
        colName,
        mainButtonLabel,
        secondaryButtonLabel,
        secondaryButtonAction,
        showState,
        onClose } = props;
    const [show, setShow] = React.useState(true);

    const columns = [
        {
            name: 'id',
            label: 'id',
        }, {
            name: 'score',
            label: 'score',
        }, {
            name: 'name',
            label: 'name',
        }, {
            name: 'match',
            label: 'match',
        }, {
            name: 'action',
            label: 'action'
        }
    ]

    const options = {
        selectableRows: "none",
        customToolbar: () => {
            return (
                <>
                </>
            )
        },
    }

    const [myMetaData, setMyMetaData] = React.useState<any[]>([]);

    const dispatch = useDispatch();

    const dispatchMeta = (colName: string, index: number, metadata: any[]) => {
        dispatch(addMetadata(colName, index, metadata))
    }

    React.useEffect(() => {
        setShow(showState);
    }, [showState])

    React.useEffect(() => {
        if (show === false) {
            onClose();
        }
    }, [show])

    React.useEffect(() => {
        setMyMetaData(metaData);
    }, [metaData])

    const removeMeta = (dataIndex: number) => {
        let newMeta = JSON.parse(JSON.stringify(myMetaData));
        newMeta = [...newMeta.slice(0, dataIndex), ...newMeta.slice(dataIndex + 1)]
        setMyMetaData(newMeta);
    }

    const confirmMeta = (dataIndex: number) => {
        let newMeta = JSON.parse(JSON.stringify(myMetaData));
        for (const meta of newMeta) {
            meta.match = false;
        }
        newMeta[dataIndex].match = true;
        setMyMetaData(newMeta);
    }

    const deConfirmMeta = (dataIndex: number) => {
        let newMeta = JSON.parse(JSON.stringify(myMetaData));
        for (const meta of newMeta) {
            meta.match = false;
        }
        setMyMetaData(newMeta);
    }

    const confirm = () => {
        dispatchMeta(colName, dataIndex, myMetaData);
        setShow(false);
    }


    return (
        <>
            <div className='big-modal'>

                <Modal show={show} onHide={() => { setShow(false) }} className='big-modal'>
                    <Modal.Header closeButton>
                        <Modal.Title>{titleText}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className='meta-data-table'>
                            <MUIDataTable
                                title=''
                                columns={columns.map((col) => {
                                    const newCol = {
                                        label: col.label,
                                        name: col.name,
                                        options: {
                                            customBodyRenderLite: (dataIndex: number, rowIndex: number) => {
                                                switch (col.name) {
                                                    case 'match':
                                                        return myMetaData[dataIndex][col.name].toString() === 'true' ?
                                                            <div className='flex-center'>
                                                                <div className='green'></div>
                                                            </div> :
                                                            <div className='flex-center'>
                                                                <div className='orange'></div>
                                                            </div>
                                                            ;
                                                    case 'action':
                                                        return (
                                                            <div className='flex-inline'>
                                                                <div className='action-icon'>
                                                                    <DeleteIcon onClick={() => { removeMeta(dataIndex) }} />
                                                                </div>
                                                                {
                                                                    myMetaData[dataIndex].match &&
                                                                    <div className='action-icon'>
                                                                        <SelectIcon onClick={() => { deConfirmMeta(dataIndex) }} />
                                                                    </div>
                                                                }
                                                                {   !myMetaData[dataIndex].match &&
                                                                    <div className='action-icon'>
                                                                        <DeselectIcon onClick={() => { confirmMeta(dataIndex) }} />
                                                                    </div>
                                                                }

                                                            </div>
                                                        )
                                                    default:
                                                        return myMetaData[dataIndex][col.name];
                                                }
                                            }
                                        }

                                    };
                                    return newCol
                                }) as any
                                }
                                data={myMetaData}
                                options={options as any}
                            >

                            </MUIDataTable>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        {
                            secondaryButtonLabel && secondaryButtonAction &&
                            <SecondaryButton
                                cta={secondaryButtonAction}
                                label={secondaryButtonLabel} />

                        }
                        {
                            mainButtonLabel &&
                            <MainButton cta={() => {confirm()}} label={mainButtonLabel} />
                        }


                    </Modal.Footer>
                </Modal>
            </div>
        </>
    )
}

export default MetaTableModal;