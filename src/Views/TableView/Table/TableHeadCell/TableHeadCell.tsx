import style from "./TableHeadCell.module.scss";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addContext, removeContext } from "../../../../Redux/action/contextMenu";
import { selectColumn, deselectColumn, deleteColumn, filterCol, removeFilter } from "../../../../Redux/action/columns";
import { selectContext, deleteContext, extendColMetaContext, openFilterDialog, openAutoMatchingDialog } from "../../../../ContextItems/ContextItems";
import { ReactComponent as SelectedIcon } from "../../../../Assets/icon-set/selected/select.svg";
import { ReactComponent as UnselectedIcon } from "../../../../Assets/icon-set/selected/select-empty.svg";
import { ReactComponent as NewIcon } from "../../../../Assets/icon-set/new/new.svg";
import { ReactComponent as RiconciliatedIcon } from "../../../../Assets/icon-set/riconciliate/link.svg";
import { ReactComponent as FilterIcon } from "../../../../Assets/icon-set/filter/filter.svg";
import { addAllMetaData, extendColMeta } from "../../../../Redux/action/data";
import { addExtMetaCol } from "../../../../Redux/action/columns";
import { colInterface } from "../../../../Interfaces/col.interface";
import { contextInterface } from "../../../../Interfaces/context.interface";
import { reconciliatorInterface } from "../../../../Interfaces/reconciliator.interface";
import { cellTypeEnum } from "../../../../Enums/cell-type.enum";
import { contextTypeEnum } from "../../../../Enums/context-type.enum";
import { compileFunction } from "vm";
import DropdownModal from "../../../../SharedComponents/DropdownModal/DropdownModal";
import { filterTypeEnum } from "../../../../Enums/filters-type.enum";
import NumberInputModal from "../../../../SharedComponents/NumberInputModal/NumberInputModal";
import { RootState } from "../../../../Redux/store";
import { metaResponseInterface } from "../../../../Interfaces/meta-response.interface";
import { useTranslation } from "react-i18next";

const TableHeadCell = (props: { col: colInterface }) => {
    const { t } = useTranslation();

    const { col } = props;
    let clickRef = React.useRef(null);
    const Data = useSelector((state: RootState) => state.Data);
    const Name = useSelector((state: RootState) => state.Name)
    const [filterDialogIsOpen, setFilterDialogIsOpen] = React.useState<boolean>(false);
    const [automatchingDialogIsOpen, setAutomatchingDialogIsOpen] = React.useState<boolean>(false);
    const [filterToApply, setFilterToApply] = React.useState<string | null>(null);
    const [automatchingValue, setAutoMatchingValue] = React.useState<number | undefined>(undefined);
    const [matchingNumber, setMatchingNumber] = React.useState<number>(0);
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
        const contextProps = {
            xPos,
            yPos,
            type: contextTypeEnum.header,
            items: col.reconciliated ? [
                selectContext(col, dispatchSelectCol, dispatchDeselectCol, dispatchRemoveContext, t),
                deleteContext(col, dispatchDeleteCol, dispatchRemoveContext, t),
                extendColMetaContext(col, dispatchExtendColMeta, dispatchRemoveContext, dispatchAddExtMetaCol, t),
                openFilterDialog(col, setFilterDialogIsOpen, dispatchRemoveFilters, dispatchRemoveContext, t),
                openAutoMatchingDialog(setAutomatchingDialogIsOpen, dispatchRemoveContext, t),
            ] :
                [
                    selectContext(col, dispatchSelectCol, dispatchDeselectCol, dispatchRemoveContext, t),
                    deleteContext(col, dispatchDeleteCol, dispatchRemoveContext, t),
                ]
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



    }, [Data, automatchingDialogIsOpen])


    return (
        <>
            {
                col.type === 'DATA' &&
                <div className={`${style.headerCell}`}
                    ref={(r) => { handleRef(r) }}
                    onContextMenu={(e) => { displayContextMenu(e, col) }}>
                    <div className={style.statusCell}>
                        {
                            col.selected &&
                            <span onClick={() => { dispatchDeselectCol(col.name) }} className={style.cursorPointer}>
                                <SelectedIcon />
                            </span>

                        }
                        {
                            !col.selected &&
                            <span onClick={() => { dispatchSelectCol(col.name) }} className={style.cursorPointer}>
                                <UnselectedIcon />
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
                            <FilterIcon />
                        }
                    </div>
                    <div className={style.accessorCell}>
                        <p>
                            {col.label}
                        </p>
                        {col.reconciliated &&
                            <p>
                                {col.reconciliator}
                            </p>}
                    </div>
                </div>
            }
            {col.type === 'INDEX' &&
                <div>
                    {col.label}
                </div>

            }
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
                    value={automatchingValue || metaMinMax.min}
                />
            }

        </>
    )

}

export default TableHeadCell;