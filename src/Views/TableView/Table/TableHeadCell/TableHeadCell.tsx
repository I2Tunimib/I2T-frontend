import style from "./TableHeadCell.module.css";
import React from "react";
import { useDispatch } from "react-redux";
import { addContext, removeContext } from "../../../../Redux/action/contextMenu";
import { selectColumn, deselectColumn, deleteColumn } from "../../../../Redux/action/columns";
import { selectContext, deleteContext, extendColMetaContext } from "../../../../ContextItems/ContextItems";
import { ReactComponent as SelectedIcon } from "../../../../Assets/icon-set/selected/select.svg";
import { ReactComponent as UnselectedIcon } from "../../../../Assets/icon-set/selected/select-empty.svg";
import { ReactComponent as NewIcon } from "../../../../Assets/icon-set/new/new.svg";
import { ReactComponent as RiconciliatedIcon} from "../../../../Assets/icon-set/riconciliate/link.svg";
import {extendColMeta} from "../../../../Redux/action/data";
import { addExtMetaCol} from "../../../../Redux/action/columns";
import { colInterface } from "../../../../Interfaces/col.interface";
import { contextInterface } from "../../../../Interfaces/context.interface";
import { reconciliatorInterface } from "../../../../Interfaces/reconciliator.interface";
import { cellTypeEnum } from "../../../../Enums/cell-type.enum";
import { contextTypeEnum } from "../../../../Enums/context-type.enum";

const TableHeadCell = (props: {col: colInterface}) => {


    const { col } = props;
    let clickRef = React.useRef(null);
    const dispatch = useDispatch();
    const dispatchContext = (context: contextInterface) => {
        dispatch(addContext(context));
    }
    const dispatchSelectCol = (colName: string) => {
        dispatch(selectColumn(colName))
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
    const dispatchAddExtMetaCol = (name: string, colType: cellTypeEnum, extendedCol: string) => {
        dispatch(addExtMetaCol(name, colType, extendedCol));
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
                selectContext(col, dispatchSelectCol, dispatchDeselectCol, dispatchRemoveContext),
                deleteContext(col, dispatchDeleteCol, dispatchRemoveContext),
                extendColMetaContext(col, dispatchExtendColMeta, dispatchRemoveContext, dispatchAddExtMetaCol),
            ]: 
            [
                selectContext(col, dispatchSelectCol, dispatchDeselectCol, dispatchRemoveContext),
                deleteContext(col, dispatchDeleteCol, dispatchRemoveContext),
            ]
        }
        dispatchContext(contextProps);

    }

    const handleRef = (r:any) => {
        clickRef.current = r;
    };



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
                            <SelectedIcon />
                        }
                        {
                            !col.selected &&
                            <UnselectedIcon />
                        }
                        {
                            col.new &&
                            <NewIcon />
                        }
                        {
                            col.reconciliated && 
                            <RiconciliatedIcon/>
                        }
                    </div>
                    <div className={style.accessorCell}>
                        <p>
                            {col.label}
                        </p>
                    </div>
                </div>
            }
            {   col.type === 'INDEX' &&
                <div>
                    {col.label}
                </div>

            }
            {
                col.type === 'METAID' &&
                <div className={`${style.headerCell}`}
                    ref={(r) => { handleRef(r) }}
                    onContextMenu={(e) => { displayContextMenu(e, col) }}>
                    <div className={style.statusCell}>
                        {
                            col.selected &&
                            <SelectedIcon />
                        }
                        {
                            !col.selected &&
                            <UnselectedIcon />
                        }
                        {
                            col.new &&
                            <NewIcon />
                        }
                        {
                            col.reconciliated && 
                            <RiconciliatedIcon/>
                        }
                    </div>
                    <div className={style.accessorCell}>
                        <p>
                            {col.label}
                        </p>
                    </div>
                </div>
            }

        </>
    )

}

export default TableHeadCell;