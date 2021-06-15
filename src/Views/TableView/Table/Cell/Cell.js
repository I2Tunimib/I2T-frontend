import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { addEditableCell } from "../../../../Redux/action/editableCell";
import { addContext, removeContext } from "../../../../Redux/action/openContext";
import style from "./Cell.module.css";
import { editContext, extContext, deleteLineContext, seeMetaDataContext, riconciliateContext } from "../../../../ContextItems/ContextItems";
import { extendRow, extendedRow } from "../../../../Redux/action/extendRow";
import { deleteLine } from "../../../../Redux/action/loadDataSuccess"
import ClassicModal from "../../../../SharedComponents/ClassicModal/ClassicModal";
import { reconciliate } from "../../../../Redux/action/reconciliate";
import AreaModal from "../../../../SharedComponents/AreaModal/AreaModal";

const Cell = (props) => {
    const { dataIndex, col, rowsPerPage, pageIndex, lastDeletedCol, lastSortedCol } = props;
    const keyName = col.name;

    const LoadedData = useSelector(state => state.LoadedData);
    const ToExtendRows = useSelector(state => state.ToExtendRows);
    const HasExtended = useSelector(state => state.HasExtended);

    const [idLinks, setIdLinks] = React.useState('');
    const [itHasToExt, setItHasToExt] = React.useState(false);
    const [metaModalIsOpen, setMetaModalIsOpen] = React.useState(false);
    let clickRef = React.useRef(null);

    const cellValue = LoadedData[dataIndex] ? LoadedData[dataIndex][keyName] : null;
    const payLoad = {
        column: keyName,
        index: dataIndex,
        label: cellValue.label || '',
    }

    React.useEffect(() => {
        if (col.type === 'extMetaCol') {
            setIdLinks(cellValue.map((el) => {
                const link =`https://www.wikidata.org/wiki/${el}`
                return (
                    <a key={el} href={link}>
                        {el}
                    </a>
                )
            }));
        }
    }, [col.type])

    const dispatch = useDispatch();
    const dispatchEditableCell = (rowIndex, keyName) => {
        dispatch(addEditableCell(rowIndex, keyName));
    }
    const dispatchContext = (context) => {
        dispatch(addContext(context));
    }
    const dispatchRemoveContext = () => {
        dispatch(removeContext());
    }
    const dispatchExtendRow = (index) => {
        dispatch(extendRow(index))
    }
    const dispatchDeleteLine = (index) => {
        dispatch(deleteLine(index));
    }
    const dispatchReconciliate = (payload) => {
        dispatch(reconciliate(payload));
    }

    const modContext = editContext(dataIndex, keyName, dispatchEditableCell, dispatchRemoveContext);
    const extendContext = extContext(dataIndex, dispatchExtendRow, dispatchRemoveContext);
    const metaDataContext = seeMetaDataContext(setMetaModalIsOpen, dispatchRemoveContext);
    const deleteRowContext = deleteLineContext(dataIndex, dispatchDeleteLine, dispatchRemoveContext);
    const riconciliateCellContext = riconciliateContext(dispatchReconciliate, payLoad, dispatchRemoveContext);
    const [contextCellItems, setContextCellItems] = React.useState([modContext, deleteRowContext]);


    // setting context at init 
    React.useEffect(() => {
        if (HasExtended) {
            checkIfHasToBeExtensible();
        }
    }, [HasExtended, pageIndex, rowsPerPage, ToExtendRows])

    React.useEffect(() => {
        if (keyName !== 'index') {
            if (itHasToExt) {
                setContextCellItems([modContext, extendContext, metaDataContext, riconciliateCellContext])
            } else {
                setContextCellItems([modContext, metaDataContext, riconciliateCellContext]);
            }
        } else {
            setContextCellItems([deleteRowContext]);
        }

    }, [itHasToExt])

    // const [cellValue, setCellValue] = React.useState(null);

    /*React.useEffect(()=> {
        setCellValue(null)
        if(LoadedData[dataIndex]){
            setCellValue(LoadedData[dataIndex][keyName]);
        }
        
    },[LoadedData, rowsPerPage, pageIndex, lastDeletedCol])*/

    const checkIfHasToBeExtensible = () => {
        for (const extCol of ToExtendRows) {
            if (extCol.rowIndex === dataIndex) {
                setItHasToExt(true);
                return;
            }
        }
        setItHasToExt(false);
    }

    const handleRef = (r) => {
        clickRef.current = r;
    };

    const displayContextMenu = (e) => {
        e.preventDefault();
        let xPos = e.clientX // - bounds.left;
        let yPos = e.clientY // - bounds.top;
        const contextProps = {
            xPos,
            yPos,
            type: "cellContext",
            items: contextCellItems,
        }
        dispatchContext(contextProps);
    }


    return (
        <>
            {  col.type !== 'extMetaCol' &&
                <div onContextMenu={(e) => { displayContextMenu(e) }} ref={(r) => { handleRef(r) }} onClick={() => { dispatchRemoveContext() }} className={style.cell}>
                    {cellValue &&
                        cellValue.label}
                </div>
            }
            {col.type === 'extMetaCol' &&
                <div>
                    {idLinks}
                </div>
            }
            {
                metaModalIsOpen &&
                <ClassicModal
                    metadataModal={true}
                    titleText={`Metadati cella: ${keyName}-${dataIndex}`}
                    text={cellValue.metadata.length > 0 ? JSON.stringify(cellValue.metadata, null, 2) : 'Non ci sono metadati disponibili per questa cella'}
                    showState={metaModalIsOpen}
                    onClose={() => { setMetaModalIsOpen(false) }}
                    mainButtonLabel={cellValue.metadata.length > 0 ? 'Modifica' : null}
                    mainButtonAction={() => {/*Do something here */ }}
                    secondaryButtonLabel="Chiudi"
                    secondaryButtonAction={() => setMetaModalIsOpen(false)}
                />
            }

        </>
    )
}

export default Cell;