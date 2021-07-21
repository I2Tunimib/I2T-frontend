import { Modal } from "react-bootstrap";
import style from "./MetaTableModal.module.scss";
import React from "react";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import MainButton from "../MainButton/MainButton";
import { metaTableModalPropsInterface } from "../../Interfaces/meta-table-modal-props.interface";
import MUIDataTable from "mui-datatables";
import { ReactComponent as DeleteIcon } from "../../Assets/icon-set/delete/trash.svg";
import { ReactComponent as SelectIcon } from "../../Assets/icon-set/selected/select.svg";
import { ReactComponent as DeselectIcon } from "../../Assets/icon-set/selected/select-empty.svg";
import { addMetadata } from "../../Redux/action/data";
import { useDispatch, useSelector } from "react-redux";
//import undoIcon from '../../Assets/icon-set/undo-circular-arrow.png';
import { RootState } from "../../Redux/store";
import { ReactComponent as UndoIcon } from '../../Assets/icon-set/undo-circular-arrow.svg';



export const MetaTableModal = (props: metaTableModalPropsInterface) => {
    const {
        titleText,
        metaData,
        dataIndex,
        col,
        mainButtonLabel,
        secondaryButtonLabel,
        secondaryButtonAction,
        showState,
        onClose } = props;
    const [show, setShow] = React.useState(true);
    const Config = useSelector((state: RootState) => state.Config)
    const [columns, setColumns] = React.useState<{ name: string, label: string }[]>([]);
    const colName = col.name;
    const Data = useSelector((state: RootState) => state.Data)
    React.useEffect(() => {
        let myCols = []
        if (Config) {
            for (const recon of Config.reconciliators) {
                if (col.reconciliator === recon.name) {
                    for (const col of recon.metaToViz) {
                        myCols.push({
                            name: col,
                            label: col
                        })
                    }
                    myCols.push({
                        name: 'action',
                        label: "action",
                    })
                    setColumns(myCols);
                    break;
                }

            }
        }

    }, [Config, col])

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
        const labelValue = Data[dataIndex].label;
        for(let i = 0;  i < Data.length; i++) {
            if(Data[i].label === labelValue) {
                dispatchMeta(colName, i, myMetaData);
            }
        }
        //dispatchMeta(colName, dataIndex, myMetaData);
        setShow(false);
    }

    const undo = () => {
        setMyMetaData(metaData);
    }


    return (
        <>
            <div>

                <Modal show={show} onHide={() => { setShow(false) }} className='big-modal'>
                    <Modal.Header closeButton>
                        <Modal.Title> <h3 className='inline'>{titleText}</h3> <UndoIcon className='undo-icon' onClick={() => { undo() }} /></Modal.Title>

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
                                                                <div>
                                                                    <DeleteIcon className='action-icon' onClick={() => { removeMeta(dataIndex) }} />
                                                                </div>
                                                                {
                                                                    myMetaData[dataIndex].match &&
                                                                    <div>
                                                                        <SelectIcon className='action-icon stroke' onClick={() => { deConfirmMeta(dataIndex) }} />
                                                                    </div>
                                                                }
                                                                {!myMetaData[dataIndex].match &&
                                                                    <div >
                                                                        <DeselectIcon className='action-icon stroke' onClick={() => { confirmMeta(dataIndex) }} />
                                                                    </div>
                                                                }

                                                            </div>
                                                        )
                                                    default:
                                                        return myMetaData[dataIndex][col.name].toString();
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
                            <MainButton cta={() => { confirm() }} label={mainButtonLabel} />
                        }


                    </Modal.Footer>
                </Modal>
            </div>
        </>
    )
}

export default MetaTableModal;