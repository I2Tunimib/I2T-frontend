import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { addEditableCell } from "../../../../Redux/action/editableCell";
import { addContext, removeContext } from "../../../../Redux/action/contextMenu";
import style from "./Cell.module.css";
import { editContext, deleteLineContext, riconciliateContext, viewMetaTable } from "../../../../ContextItems/ContextItems";
import { extendRow } from "../../../../Redux/action/extendRow";
import { deleteLine } from "../../../../Redux/action/data"
import { reconciliate } from "../../../../Redux/action/reconciliate";
import { RootState } from "../../../../Redux/store";
import { contextInterface } from "../../../../Interfaces/context.interface";
import { contextTypeEnum } from "../../../../Enums/context-type.enum";
import { cellPropsInterface } from "../../../../Interfaces/cell-props.interface";
import { cellInterface } from "../../../../Interfaces/cell.interface";
import MetaTableModal from "../../../../SharedComponents/MetaTableModal/MetaTableModal";
import { useTranslation } from 'react-i18next';

const Cell = (props: cellPropsInterface) => {
    const { dataIndex, col, rowsPerPage, pageIndex } = props;
    const keyName = col.name;
    const { t } = useTranslation();

    const Config = useSelector((state: RootState) => state.Config);
    const FilteredData = useSelector((state: RootState) => state.FilteredData);
    // const ToExtendRows = useSelector((state: RootState) => state.ToExtendRows);
    // const HasExtended = useSelector(state => state.HasExtended);

    const [idLinks, setIdLinks] = React.useState<JSX.Element[]>();
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

    const modContext = editContext(realDataIndex!, keyName, dispatchEditableCell, dispatchRemoveContext, t);
    const deleteRowContext = deleteLineContext(realDataIndex!, dispatchDeleteLine, dispatchRemoveContext, t);
    const riconciliateCellContext = riconciliateContext(dispatchReconciliate, payLoad, dispatchRemoveContext, t);
    const viewMetaTableContext = viewMetaTable(setTableMetaModalsOpen, dispatchRemoveContext, t);


    const [contextCellItems, setContextCellItems] = React.useState([modContext, deleteRowContext]);


    React.useEffect(() => {
        if (cellValue) {
            if (keyName !== 'index') {
                if (cellValue.metadata.length > 0) {
                    setContextCellItems([modContext, riconciliateCellContext, viewMetaTableContext]);
                } else {
                    setContextCellItems([modContext, riconciliateCellContext]);
                }
            } else {
                setContextCellItems([deleteRowContext]);
            }
        }


    }, [cellValue])

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
                {tableMetaModalIsOpen &&
                    <MetaTableModal
                        titleText={cellValue.label}
                        metaData={cellValue.metadata}
                        dataIndex={realDataIndex!}
                        col={col}
                        mainButtonLabel={t('buttons.confirm')}
                        secondaryButtonLabel={t('buttons.cancel')}
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