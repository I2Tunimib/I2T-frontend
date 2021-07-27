import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addContext, removeContext } from "../../../../Redux/action/contextMenu";
import { selectColumn, deselectColumn, deleteColumn, filterCol, removeFilter } from "../../../../Redux/action/columns";
import { selectContext, deleteContext, extendColMetaContext, openFilterDialog, openAutoMatchingDialog, viewMetaTable } from "../../../../ContextItems/ContextItems";
import { ReactComponent as SelectedIcon } from "../../../../Assets/icon-set/selected/select.svg";
import { ReactComponent as UnselectedIcon } from "../../../../Assets/icon-set/selected/select-empty.svg";
import { ReactComponent as NewIcon } from "../../../../Assets/icon-set/new/new.svg";
import { ReactComponent as RiconciliatedIcon } from "../../../../Assets/icon-set/riconciliate/link.svg";
import { ReactComponent as FilterIcon } from "../../../../Assets/icon-set/filter/filter.svg";
import { addAllMetaData, extendColMeta } from "../../../../Redux/action/data";
import { addExtMetaCol } from "../../../../Redux/action/columns";
import { colInterface } from "../../../../Interfaces/col.interface";
import { contextInterface } from "../../../../Interfaces/context.interface";
import { contextTypeEnum } from "../../../../Enums/context-type.enum";
import DropdownModal from "../../../../SharedComponents/DropdownModal/DropdownModal";
import { filterTypeEnum } from "../../../../Enums/filters-type.enum";
import NumberInputModal from "../../../../SharedComponents/NumberInputModal/NumberInputModal";
import { RootState } from "../../../../Redux/store";
import { metaResponseInterface } from "../../../../Interfaces/meta-response.interface";
import { useTranslation } from "react-i18next";
import MetaTableModal from "../../../../SharedComponents/MetaTableModal/MetaTableModal";
import { Overlay, Tooltip } from "react-bootstrap";
const TableHeadCell = (props: { col: colInterface }) => {
    const { t } = useTranslation();

    const { col } = props;
    let clickRef = React.useRef(null);
    const Data = useSelector((state: RootState) => state.Data);
    const Name = useSelector((state: RootState) => state.Name);
    const target = React.useRef(null);
    const [filterDialogIsOpen, setFilterDialogIsOpen] = React.useState<boolean>(false);
    const [automatchingDialogIsOpen, setAutomatchingDialogIsOpen] = React.useState<boolean>(false);
    const [filterToApply, setFilterToApply] = React.useState<string | null>(null);
    const [automatchingValue, setAutoMatchingValue] = React.useState<number | undefined>(undefined);
    const [matchingNumber, setMatchingNumber] = React.useState<number>(0);
    const [tableMetaModalIsOpen, setTableMetaModalsOpen] = React.useState<boolean>(false);
    const [headerReconState, setHeaderReconState] = React.useState<string>('none');
    const [tooltipShow, setTooltipShow] = React.useState<boolean>(false);
    const availableFilters = [
        {
            label: "Match: true",
            value: filterTypeEnum.matchTrue
        },
        {
            label: "Match: false",
            value: filterTypeEnum.matchFalse
        },
        {
            label: "Score: > 50",
            value: filterTypeEnum.scoreOver
        },
        {
            label: "Score: < 50",
            value: filterTypeEnum.scoreUnder
        },
        {
            label: "Metadata: disponibili",
            value: filterTypeEnum.metaTrue
        },
        {
            label: "Metadata: non disponibili",
            value: filterTypeEnum.metaFalse
        }
    ]
    const [metaMinMax, setMetaMinMax] = React.useState<{ min: number, max: number }>({ min: 0, max: 0 })
    const dispatch = useDispatch();
    const dispatchContext = (context: contextInterface) => {
        dispatch(addContext(context));
    }
    const dispatchSelectCol = (colName: string) => {
        dispatch(selectColumn(colName))
    }
    const dispatchAllMeta = (changedMeta: metaResponseInterface) => {
        dispatch(addAllMetaData(changedMeta));
    }
    const dispatchDeselectCol = (colName: string) => {
        dispatch(deselectColumn(colName))
    }
    const dispatchDeleteCol = (colName: string) => {
        dispatch(deleteColumn(colName))
    }
    const dispatchRemoveContext = () => {
        dispatch(removeContext());
    }
    const dispatchExtendColMeta = (colName: string, reconciliator: string) => {
        dispatch(extendColMeta(colName, reconciliator));
    }
    const dispatchAddExtMetaCol = (extendedCol: string, isExtended: boolean) => {
        dispatch(addExtMetaCol(extendedCol, isExtended));
    }
    const dispatchFilteredCol = (filter: string | null, colName: string) => {
        dispatch(filterCol(filter, colName))
    }
    const dispatchRemoveFilters = () => {
        dispatch(removeFilter());
    }

    const displayContextMenu = (e: any, col: colInterface) => {
        e.preventDefault();
        // let bounds = clickRef.current.getBoundingClientRect();
        let xPos = e.clientX // - bounds.left;
        let yPos = e.clientY // - bounds.top;
        const contextItems = col.reconciliated ? [
            selectContext(col, dispatchSelectCol, dispatchDeselectCol, dispatchRemoveContext, t),
            deleteContext(col, dispatchDeleteCol, dispatchRemoveContext, t),
            extendColMetaContext(col, dispatchExtendColMeta, dispatchRemoveContext, dispatchAddExtMetaCol, t),
            openFilterDialog(col, setFilterDialogIsOpen, dispatchRemoveFilters, dispatchRemoveContext, t),
            openAutoMatchingDialog(setAutomatchingDialogIsOpen, dispatchRemoveContext, t),
        ] :
            [
                selectContext(col, dispatchSelectCol, dispatchDeselectCol, dispatchRemoveContext, t),
                deleteContext(col, dispatchDeleteCol, dispatchRemoveContext, t),
            ];
        if (col.metadata.length >= 1) {
            contextItems.push(viewMetaTable(setTableMetaModalsOpen, dispatchRemoveContext, t))
        }
        const contextProps = {
            xPos,
            yPos,
            type: contextTypeEnum.header,
            items: contextItems,
        }
        dispatchContext(contextProps);

    }

    const handleRef = (r: any) => {
        clickRef.current = r;
    };

    const confirmAutoMatching = () => {
        const metaToChange: metaResponseInterface = {
            name: Name,
            items: [],
        }

        for (let i = 0; i < Data.length; i++) {
            const newMeta: any = JSON.parse(JSON.stringify(Data[i][col.name].metadata));
            // let validMetas: any[] = [];
            let higherScore: number = 0;
            for (const metaItem of newMeta) {
                if (metaItem.score > higherScore) {
                    higherScore = metaItem.score;
                }
            }
            for (const metaItem of newMeta) {
                if (metaItem.score === higherScore && metaItem.score > (automatchingValue || 10000)) {
                    metaItem.match = true;
                    break;
                    /*metaToChange.items.push({
                        column: col.name,
                        index: i,
                        label: Data[i][col.name].label,
                        metadata: meta
                    })*/
                }
            }
            metaToChange.items.push({
                column: col.name,
                index: i,
                label: Data[i][col.name].label,
                metadata: newMeta,
            })
        }
        dispatchAllMeta(metaToChange)
    }


    React.useEffect(() => {
        if (automatchingDialogIsOpen) {
            let matchingItemsNumber = 0;
            for (const row of Data) {
                for (const metaItem of row[col.name].metadata) {
                    if (metaItem.score >= (automatchingValue || 10000) || metaItem.match) {
                        matchingItemsNumber++;
                        break;
                    }
                }
            }
            setMatchingNumber(matchingItemsNumber);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [Data, automatchingValue])

    React.useEffect(() => {
        let maxValue = 0;
        let minValue = 1000;

        for (const row of Data) {
            if (row[col.name]) {
                for (const metaItem of row[col.name].metadata) {
                    if (metaItem.score >= maxValue) {
                        maxValue = metaItem.score;
                    }
                    if (metaItem.score <= minValue) {
                        minValue = metaItem.score;
                    }
                }
            }
            setMetaMinMax({ min: minValue, max: maxValue });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [Data, automatchingDialogIsOpen])

    React.useEffect(() => {
        if (col.metadata.length >= 1) {
            let isTrue = false;
            for (const metaItem of col.metadata) {
                if (metaItem.match === true) {
                    isTrue = true;
                }
            }
            if (isTrue) {
                // console.log('ciao');
                setHeaderReconState('green');
            } else {
                setHeaderReconState('orange');
            }
        }
    }, [col.metadata, col])


    return (
        <>
            <div className='table-head-cell'>
                {
                    col.type === 'DATA' &&
                    <div className='header-cell'
                        ref={(r) => { handleRef(r) }}
                        onContextMenu={(e) => { displayContextMenu(e, col) }}>
                        <div className='status-cell'>
                            {
                                col.selected &&
                                <span onClick={() => { dispatchDeselectCol(col.name) }} className='cursor-pointer'>
                                    <SelectedIcon className='stroke' />
                                </span>

                            }
                            {
                                !col.selected &&
                                <span onClick={() => { dispatchSelectCol(col.name) }} className='cursor-pointer'>
                                    <UnselectedIcon className='stroke' />
                                </span>

                            }
                            {
                                col.new &&
                                <NewIcon />
                            }
                            {
                                col.reconciliated &&
                                <RiconciliatedIcon />
                            }
                            {
                                col.filtered &&
                                <span onClick={() => { dispatchRemoveFilters(); }} className='cursor-pointer'>
                                    <FilterIcon />
                                </span>

                            }
                        </div>
                        <div className='accessor-cell'>
                            <div className="label-cell">
                                {
                                    headerReconState !== 'none' &&
                                    <div
                                        ref={target}
                                        className={`meta-dot ${headerReconState}`}
                                        onMouseEnter={(e) => { setTooltipShow(true) }}
                                        onMouseLeave={() => { setTooltipShow(false) }}>
                                    </div>
                                }
                                <p>
                                    {col.label}
                                </p>
                            </div>

                            {col.reconciliated &&
                                <p>
                                    {col.reconciliator}
                                </p>
                            }
                            {
                                !col.reconciliated &&
                                <div className='spacer'>

                                </div>
                            }
                        </div>
                    </div>
                }
                {col.type === 'INDEX' &&
                    <div>
                        {col.label}
                    </div>

                }
            </div>
            {
                filterDialogIsOpen &&
                <DropdownModal
                    inputLabel='Scegli filtro'
                    titleText={`Filtra colonna ${col.name}`}
                    text="Scegli il filtro da applicare"
                    mainButtonLabel='Applica'
                    mainButtonAction={() => { dispatchFilteredCol(filterToApply, col.name); setFilterDialogIsOpen(false) }}
                    secondaryButtonLabel='Annulla'
                    secondaryButtonAction={() => { setFilterDialogIsOpen(false) }}
                    showState={filterDialogIsOpen}
                    onClose={() => { setFilterDialogIsOpen(false); }}
                    inputValues={availableFilters}
                    setInputValue={(value: { label: string, value: string }) => { setFilterToApply(value ? value.value : null) }}
                />
            }
            {
                automatchingDialogIsOpen &&
                <NumberInputModal
                    inputLabel={'Scegli la soglia di score oltre la quale confermare il matching'}
                    titleText={'Finalizza matching'}
                    text={
                        `Alla soglia selezionata si hanno ${matchingNumber} matching`
                    }
                    minMax={metaMinMax}
                    mainButtonLabel='Applica'
                    mainButtonAction={() => { confirmAutoMatching(); setAutomatchingDialogIsOpen(false) }}
                    secondaryButtonLabel='Annulla'
                    secondaryButtonAction={() => { setAutomatchingDialogIsOpen(false) }}
                    showState={automatchingDialogIsOpen}
                    onClose={() => setAutomatchingDialogIsOpen(false)}
                    setInputValue={(value: number) => { setAutoMatchingValue(value) }}
                    value={automatchingValue || ((metaMinMax.max + metaMinMax.min) / 2)}
                />
            }
            {tableMetaModalIsOpen &&
                <MetaTableModal
                    titleText={col.label}
                    metaData={col.metadata}
                    dataIndex={-1}
                    col={col}
                    mainButtonLabel={t('buttons.confirm')}
                    secondaryButtonLabel={t('buttons.cancel')}
                    secondaryButtonAction={() => { setTableMetaModalsOpen(false) }}
                    showState={tableMetaModalIsOpen}
                    onClose={() => { setTableMetaModalsOpen(false) }}

                />

            }
            <Overlay target={target.current} show={tooltipShow} placement="top">
                {(props) => (
                    <Tooltip id="overlay-example" {...props}>
                        {headerReconState === 'green' &&
                            <>
                                {t('table.cells.meta-tooltip.is-true')}
                            </>
                        }
                        {headerReconState === 'orange' &&
                            <>
                                {t('table.cells.meta-tooltip.is-not-true')}
                            </>
                        }

                    </Tooltip>
                )}
            </Overlay>
        </>
    )

}

export default TableHeadCell;