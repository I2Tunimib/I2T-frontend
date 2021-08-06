import { Modal } from "react-bootstrap";
import React from "react";
import SecondaryButton from "../SecondaryButton/SecondaryButton";
import MainButton from "../MainButton/MainButton";
import { metaTableModalPropsInterface } from "../../Interfaces/meta-table-modal-props.interface";
import MUIDataTable from "mui-datatables";
import { ReactComponent as DeleteIcon } from "../../Assets/icon-set/delete/trash.svg";
import { ReactComponent as SelectIcon } from "../../Assets/icon-set/radio_button/full.svg";
import { ReactComponent as DeselectIcon } from "../../Assets/icon-set/radio_button/empty.svg";
import { addMetadata } from "../../Redux/action/data";
import { addMetaColumn } from "../../Redux/action/columns";
import { useDispatch, useSelector } from "react-redux";
//import undoIcon from '../../Assets/icon-set/undo-circular-arrow.png';
import { RootState } from "../../Redux/store";
import { ReactComponent as UndoIcon } from '../../Assets/icon-set/undo-circular-arrow.svg';



export const MetaTableModal = (props: metaTableModalPropsInterface) => {

    // this modal show metadata of a cell.

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
        console.log(metaData);
    const [show, setShow] = React.useState(true);
    const Config = useSelector((state: RootState) => state.Config)
    const [columns, setColumns] = React.useState<{ name: string, label: string }[]>([]);
    const colName = col.name;
    const Data = useSelector((state: RootState) => state.Data);
    const [link, setLink] = React.useState<string | null>();
    // console.log(metaData);
    React.useEffect(() => {
        let myCols: any[] = []
        // if i want to look at headercell metadata or i dont have infos about which reconciliation service i've used to get metadata,
        // i use default columns
        if (dataIndex === -1 || col.reconciliator === "") {
            myCols = [{
                name: "id",
                label: "id"
            }, {
                name: "score",
                label: "score",
            }, {
                name: "match",
                label: "match"
            }, {
                name: "name",
                label: "name"
            }, {
                name: "action",
                label: "action"
            }]
        } else {
            // else if i've saved in the column a reconciliator, i look for columns to display in config data
            if (Config) {
                for (const recon of Config.reconciliators) {
                    if (col.reconciliator === recon.name) {
                        setLink(recon.entityPageUrl);
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
                        break;
                    }
                }
            }
        }
        setColumns(myCols);


        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [Config, col])

    // options for the table
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
    const dispatchMetaColumns = (meta: any, column: string) => {
        dispatch(addMetaColumn(meta, column));
    }
    React.useEffect(() => {
        setShow(showState);
    }, [showState])

    React.useEffect(() => {
        if (show === false) {
            onClose();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show])

    React.useEffect(() => {
        setMyMetaData(metaData);
    }, [metaData])

    // if i remove an annotation i set the new metadata in myMetaData
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

    //when i confirm i dispatch changes to the store
    const confirm = () => {
        if (dataIndex === -1) {
            dispatchMetaColumns(myMetaData, col.name);
        } else {
            console.log(Data[dataIndex]);
            const labelValue = Data[dataIndex][col.name].label;
            for (let i = 0; i < Data.length; i++) {
                if (Data[i][col.name].label === labelValue) {
                    dispatchMeta(colName, i, myMetaData);
                }
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
                                                                        <SelectIcon className='action-icon' onClick={() => { deConfirmMeta(dataIndex) }} />
                                                                    </div>
                                                                }
                                                                {!myMetaData[dataIndex].match &&
                                                                    <div >
                                                                        <DeselectIcon className='action-icon stroke' onClick={() => { confirmMeta(dataIndex) }} />
                                                                    </div>
                                                                }

                                                            </div>
                                                        )
                                                    case 'name':
                                                        return <p><a className={myMetaData[dataIndex].match ? 'meta-table-link match' : 'meta-table-link'}
                                                            href={link + myMetaData[dataIndex].id}
                                                            target="_blank"
                                                            rel="noreferrer">
                                                            {myMetaData[dataIndex][col.name].toString()}
                                                        </a>
                                                        </p>
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