import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { addEditableCell } from "../../../../Redux/action/editableCell";
import { addContext, removeContext } from "../../../../Redux/action/contextMenu";
import style from "./Cell.module.css";
import { editContext, extContext, deleteLineContext, seeMetaDataContext, riconciliateContext, viewMetaTable } from "../../../../ContextItems/ContextItems";
import { extendRow } from "../../../../Redux/action/extendRow";
import { deleteLine } from "../../../../Redux/action/data"
import ClassicModal from "../../../../SharedComponents/ClassicModal/ClassicModal";
import { reconciliate } from "../../../../Redux/action/reconciliate";
import { RootState } from "../../../../Redux/store";
import { contextInterface } from "../../../../Interfaces/context.interface";
import { contextTypeEnum } from "../../../../Enums/context-type.enum";
import { cellPropsInterface } from "../../../../Interfaces/cell-props.interface";
import { cellInterface } from "../../../../Interfaces/cell.interface";
import MetaTableModal from "../../../../SharedComponents/MetaTableModal/MetaTableModal";

const Cell = (props: cellPropsInterface) => {
    const { dataIndex, col, rowsPerPage, pageIndex } = props;
    const keyName = col.name;

    const LoadedData = useSelector((state: RootState) => state.Data);
    const Config = useSelector((state: RootState) => state.Config);
    const FilteredData = useSelector((state: RootState) => state.FilteredData);
    // const ToExtendRows = useSelector((state: RootState) => state.ToExtendRows);
    // const HasExtended = useSelector(state => state.HasExtended);

    const [idLinks, setIdLinks] = React.useState<JSX.Element[]>();
    const [itHasToExt, setItHasToExt] = React.useState(false);
    const [modMetaModalIsOpen, setModMetaModalIsOpen] = React.useState(false);
    const [tableMetaModalIsOpen, setTableMetaModalsOpen] = React.useState(false);
    const [dotColor, setDotColor] = React.useState('')
    let clickRef = React.useRef(null);

    const cellValue: cellInterface = FilteredData[dataIndex] ? FilteredData[dataIndex][keyName] : null;
    const realDataIndex = cellValue ? (parseInt(FilteredData[dataIndex].index.label) - 1) : null;
    const meta = cellValue ? cellValue.metadata : [];
    const payLoad = {
        column: keyName,
        index: dataIndex,
        label: cellValue ? cellValue.label : '',
    }

    React.useEffect(() => {
        if (cellValue) {
            for (const reconciliator of Config!.reconciliators) {
                if (reconciliator.name === col.reconciliator) {
                    setIdLinks(cellValue.metadata.map((el: any) => {
                        const link = reconciliator.entityPageUrl + el.id;
                        return (
                            <a key={el.id} href={link} target="_blank" rel="noreferrer">
                                {el.name}
                            </a>
                        )
                    }))
                }
            }
            /*switch (col.reconciliator) {
                case "Wikidata":
                    setIdLinks(cellValue.metadata.map((el: any) => {
                        const link = `https://www.wikidata.org/wiki/${el.id}`
                        return (
                            
                        )
                    }));
                    break;
                case "ASIA (geonames)":
                    setIdLinks(cellValue.metadata.map((el: any) => {
                        const link = `http://sws.geonames.org/${el.id}/`
                        return (
                            <a key={el.id} href={link} target="_blank" rel="noreferrer">
                                {el.name}
                            </a>
                        )
                    }));
                    break;
                case "ASIA (keywords matcher)":
                    setIdLinks(cellValue.metadata.map((el: any) => {
                        const link = ``
                        return (
                            <a key={el.id} href={link} target="_blank" rel="noreferrer">
                                {el.name}
                            </a>
                        )
                    }));
                    break;
                case "ASIA (wikifier)":
                    setIdLinks(cellValue.metadata.map((el: any) => {
                        const link = ``
                        return (
                            <a key={el.id} href={link} target="_blank" rel="noreferrer">
                                {el.name}
                            </a>
                        )
                    }));
            }*/
        }


        /*for (const el of idArr) {
            idString = idString + {el} + '';
            console.log(idString);
        }*/
        // setIdLinks(idString);
    }, [col.type, cellValue])

    const dispatch = useDispatch();
    const dispatchEditableCell = (rowIndex: number, keyName: string) => {
        dispatch(addEditableCell(rowIndex, keyName));
    }
    const dispatchContext = (context: contextInterface) => {
        dispatch(addContext(context));
    }
    const dispatchRemoveContext = () => {
        dispatch(removeContext());
    }
    const dispatchExtendRow = (index: number) => {
        dispatch(extendRow(index))
    }
    const dispatchDeleteLine = (index: number) => {
        dispatch(deleteLine(index));
    }
    const dispatchReconciliate = (payload: any) => {
        dispatch(reconciliate(payload));
    }

    const modContext = editContext(realDataIndex!, keyName, dispatchEditableCell, dispatchRemoveContext);
    const extendContext = extContext(realDataIndex!, dispatchExtendRow, dispatchRemoveContext);
    const metaDataContext = seeMetaDataContext(setModMetaModalIsOpen, dispatchRemoveContext);
    const deleteRowContext = deleteLineContext(realDataIndex!, dispatchDeleteLine, dispatchRemoveContext);
    const riconciliateCellContext = riconciliateContext(dispatchReconciliate, payLoad, dispatchRemoveContext);
    const viewMetaTableContext = viewMetaTable(setTableMetaModalsOpen, dispatchRemoveContext);


    const [contextCellItems, setContextCellItems] = React.useState([modContext, deleteRowContext]);



    // setting context at init 
    /*React.useEffect(() => {
        if (HasExtended) {
            checkIfHasToBeExtensible();
        }
    }, [HasExtended, pageIndex, rowsPerPage, ToExtendRows])*/

    React.useEffect(() => {
        if (cellValue) {
            if (keyName !== 'index') {
                if (itHasToExt) {
                    // setContextCellItems([modContext, extendContext, metaDataContext, riconciliateCellContext])
                } else {
                    if (cellValue.metadata.length > 0) {
                        setContextCellItems([modContext, metaDataContext, riconciliateCellContext, viewMetaTableContext]);
                    } else {
                        setContextCellItems([modContext, metaDataContext, riconciliateCellContext]);
                    }

                }
            } else {
                setContextCellItems([deleteRowContext]);
            }
        }


    }, [itHasToExt, cellValue])

    React.useEffect(() => {

        if (cellValue) {

            if (cellValue.type === "DATA" && cellValue.metadata.length > 0) {
                setDotColor('orange');
                for (const meta of cellValue.metadata) {
                    if (meta.match === true) {
                        setDotColor('green');
                    }
                }
            }
        }

    }, [cellValue, meta])

    // const [cellValue, setCellValue] = React.useState(null);

    /*React.useEffect(()=> {
        setCellValue(null)
        if(LoadedData[dataIndex]){
            setCellValue(LoadedData[dataIndex][keyName]);
        }
        
    },[LoadedData, rowsPerPage, pageIndex, lastDeletedCol])*/

    /*const checkIfHasToBeExtensible = () => {
        for (const extCol of ToExtendRows) {
            if (extCol.rowIndex === dataIndex) {
                setItHasToExt(true);
                return;
            }
        }
        setItHasToExt(false);
    }*/

    const handleRef = (r: any) => {
        clickRef.current = r;
    };

    const displayContextMenu = (e: any) => {
        e.preventDefault();
        let xPos = e.clientX // - bounds.left;
        let yPos = e.clientY // - bounds.top;
        const contextProps = {
            xPos,
            yPos,
            type: contextTypeEnum.cell,
            items: contextCellItems,
        }
        dispatchContext(contextProps);
    }


    return (
        <> {
            cellValue &&
            <>
                {
                    col.type !== 'METAID' &&
                    <div onContextMenu={(e) => { displayContextMenu(e) }} ref={(r) => { handleRef(r) }} onClick={() => { dispatchRemoveContext() }} className={style.dataCell}>
                        <div>
                            {cellValue.metadata.length > 0 &&
                                <div className={`${style.metaDot} ` + dotColor}>

                                </div>
                            }

                            <div className={style.labelCell}>
                                {cellValue &&
                                    cellValue.label}
                            </div>
                        </div>
                        {
                            col.extendedMeta &&
                            <div className={style.idLinksContainer}>
                                {idLinks}
                            </div>
                        }
                    </div>
                }

                {
                    modMetaModalIsOpen &&
                    <ClassicModal
                        metadataModal={true}
                        titleText={`Metadati cella: ${keyName}-${dataIndex}`}
                        text={cellValue.metadata.length > 0 ? JSON.stringify(cellValue.metadata, null, 2) : 'Non ci sono metadati disponibili per questa cella'}
                        showState={modMetaModalIsOpen}
                        onClose={() => { setModMetaModalIsOpen(false) }}
                        mainButtonLabel={cellValue.metadata.length > 0 ? 'Modifica' : undefined}
                        mainButtonAction={() => {/*Do something here */ }}
                        secondaryButtonLabel="Chiudi"
                        secondaryButtonAction={() => setModMetaModalIsOpen(false)}
                    />
                }
                {tableMetaModalIsOpen &&
                    <MetaTableModal
                        titleText={cellValue.label}
                        metaData={cellValue.metadata}
                        dataIndex={realDataIndex!}
                        col={col}
                        mainButtonLabel="Conferma"
                        secondaryButtonLabel='Annulla'
                        secondaryButtonAction={() => { setTableMetaModalsOpen(false) }}
                        showState={tableMetaModalIsOpen}
                        onClose={() => { setTableMetaModalsOpen(false) }}

                    />

                }
            </>
        }

        </>
    )
}

export default Cell;