import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { addContext, removeContext } from "../../../../Redux/action/contextMenu";
import { editContext, deleteLineContext, riconciliateContext, viewMetaTable } from "../../../../ContextItems/ContextItems";
import { deleteLine, updateLine } from "../../../../Redux/action/data"
import { reconciliate } from "../../../../Redux/action/reconciliate";
import { RootState } from "../../../../Redux/store";
import { contextInterface } from "../../../../Interfaces/context.interface";
import { contextTypeEnum } from "../../../../Enums/context-type.enum";
import { cellPropsInterface } from "../../../../Interfaces/cell-props.interface";
import { cellInterface } from "../../../../Interfaces/cell.interface";
import MetaTableModal from "../../../../SharedComponents/MetaTableModal/MetaTableModal";
import { useTranslation } from 'react-i18next';
import InputModal from "../../../../SharedComponents/InputModal/InputModal";
import { SetStateAction } from "react";
import { Overlay, Tooltip } from "react-bootstrap";
import {ReactComponent as BottomArrow} from '../../../../Assets/Icons/arrow-bottom.svg';

const Cell = (props: cellPropsInterface) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { dataIndex, col, rowsPerPage, pageIndex } = props;
    const keyName = col.name;
    const { t } = useTranslation();
    const target = React.useRef(null);
    const Config = useSelector((state: RootState) => state.Config);
    const FilteredData = useSelector((state: RootState) => state.FilteredData);
    const Data = useSelector((state: RootState) => state.Data)
    // const ToExtendRows = useSelector((state: RootState) => state.ToExtendRows);
    // const HasExtended = useSelector(state => state.HasExtended);
    const [tooltipShow, setTooltipShow] = React.useState<boolean>(false);
    const [idLinks, setIdLinks] = React.useState<JSX.Element[]>();
    const [tableMetaModalIsOpen, setTableMetaModalsOpen] = React.useState(false);
    const [dotColor, setDotColor] = React.useState('');
    const [editModalIsOpen, setEditModalIsOpen] = React.useState(false);
    const [newValue, setNewValue] = React.useState('');
    let clickRef = React.useRef(null);

    const cellValue: cellInterface = FilteredData[dataIndex] ? FilteredData[dataIndex][keyName] : null;
    const realDataIndex = cellValue ? (parseInt(FilteredData[dataIndex].index.label) - 1) : null;
    // const meta = cellValue ? cellValue.metadata : [];
    const meta = React.useMemo(() => {
        if (cellValue) {
            return cellValue.metadata
        } else {
            return [];
        }
    }, [cellValue])
    const payLoad = {
        column: keyName,
        index: realDataIndex!,
        label: cellValue ? cellValue.label : '',
    }

    React.useEffect(() => {
        if (cellValue) {
            for (const reconciliator of Config!.reconciliators) {
                if (reconciliator.name === col.reconciliator) {
                    setIdLinks(cellValue.metadata.map((el: any) => {
                        const link = reconciliator.entityPageUrl + el.id;
                        let css = '';
                        if(el.match) {
                            css = 'match'
                        }
                        return (
                            <a key={el.id} href={link} className={css} target="_blank" rel="noreferrer">
                                {el.name}
                            </a>
                        )
                    }))
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [col.type, cellValue])

    React.useEffect(() => {
        if (editModalIsOpen) {
            setNewValue(Data[realDataIndex!][keyName].label);
        } else {
            setNewValue('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editModalIsOpen])

    const dispatch = useDispatch();
    const dispatchContext = (context: contextInterface) => {
        dispatch(addContext(context));
    }
    const dispatchRemoveContext = () => {
        dispatch(removeContext());
    }
    const dispatchDeleteLine = (index: number) => {
        dispatch(deleteLine(index));
    }
    const dispatchReconciliate = (payload: any) => {
        dispatch(reconciliate(payload));
    }
    const dispatchUpdateLine = (index: number, line: any) => {
        dispatch(updateLine(index, line))
    }

    const modContext = editContext(realDataIndex!, keyName, setEditModalIsOpen, dispatchRemoveContext, t);
    const deleteRowContext = deleteLineContext(realDataIndex!, dispatchDeleteLine, dispatchRemoveContext, t);
    const riconciliateCellContext = riconciliateContext(dispatchReconciliate, payLoad, dispatchRemoveContext, t);
    const viewMetaTableContext = viewMetaTable(setTableMetaModalsOpen, dispatchRemoveContext, t);


    const [contextCellItems, setContextCellItems] = React.useState([modContext, deleteRowContext]);


    React.useEffect(() => {
        if (cellValue) {
            if (keyName !== 'index') {
                if (cellValue.metadata.length > 0) {
                    setContextCellItems([modContext, riconciliateCellContext, viewMetaTableContext, deleteRowContext]);
                } else {
                    setContextCellItems([modContext, riconciliateCellContext, deleteRowContext]);
                }
            } else {
                setContextCellItems([deleteRowContext]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            } else if (col.reconciliated && cellValue.metadata.length === 0){
                setDotColor('red');
            }
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const edit = () => {
        const newLine = JSON.parse(JSON.stringify(Data[realDataIndex!]))
        newLine[keyName].label = newValue;
        dispatchUpdateLine(realDataIndex!, newLine);
        setEditModalIsOpen(false);
    }


    return (
        <> {
            cellValue &&
            <div className='cell'>
                <div
                    onContextMenu={(e) => { displayContextMenu(e) }} ref={(r) => { handleRef(r) }}
                    // onClick={() => { dispatchRemoveContext() }}
                    className='data-cell'>
                        {// cellValue.metadata.length > 0 &&
                            <div 
                            className={`meta-dot ` + dotColor} 
                            ref={target} 
                            onMouseEnter={(e) => { setTooltipShow(true) }}
                            onMouseLeave={() => {setTooltipShow(false)}}>

                            </div>
                        }

                        <div className='label-cell'>
                            <p>
                                {cellValue &&
                                    cellValue.label}
                            </p>
                            <BottomArrow
                            onClick={(e) => {displayContextMenu(e)}}
                            />
                        </div>
                    {
                        col.extendedMeta &&
                        <div className='id-links-container'>
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
            </div>
        }
            {editModalIsOpen &&
                <InputModal
                    inputLabel={t('table.cells.editable-cell-modal.input-label')}
                    titleText={t('table.cells.editable-cell-modal.title-text')}
                    mainButtonLabel={t('buttons.confirm')}
                    secondaryButtonLabel={t('buttons.cancel')}
                    secondaryButtonAction={() => { setEditModalIsOpen(false) }}
                    mainButtonAction={() => { edit() }}
                    setInputValue={(value: SetStateAction<string>) => { setNewValue(value) }}
                    value={newValue}
                    showState={editModalIsOpen}
                    onClose={() => { setEditModalIsOpen(false) }}
                />
            }
            <Overlay target={target.current} show={tooltipShow} placement="top">
                {(props) => (
                    <Tooltip id="overlay-example" {...props} className={dotColor}>
                        {dotColor === 'green' &&
                            <>
                                {t('table.cells.meta-tooltip.is-true')}
                            </>
                        }
                        {dotColor === 'orange' &&
                            <>
                                {t('table.cells.meta-tooltip.is-not-true')}
                            </>
                        }
                        {dotColor === 'red' &&
                        <>
                            {t('table.cells.meta-tooltip.no-label')}
                        </>
                        }

                    </Tooltip>
                )}
            </Overlay>

        </>
    )
}

export default Cell;