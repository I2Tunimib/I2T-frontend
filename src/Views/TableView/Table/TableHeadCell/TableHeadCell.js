import style from "./TableHeadCell.module.css";
import React from "react";
import { useDispatch } from "react-redux";
import { addContext, removeContext } from "../../../../Redux/action/openContext";
import { selectColumn, deselectColumn, deleteColumn } from "../../../../Redux/action/loadColumns";
import { selectContext, deleteContext, extendColMetaContext } from "../../../../ContextItems/ContextItems";
import { ReactComponent as SelectedIcon } from "../../../../Assets/icon-set/selected/select.svg";
import { ReactComponent as UnselectedIcon } from "../../../../Assets/icon-set/selected/select-empty.svg";
import { ReactComponent as NewIcon } from "../../../../Assets/icon-set/new/new.svg";
import { ReactComponent as RiconciliatedIcon} from "../../../../Assets/icon-set/riconciliate/link.svg";
import {extendColMeta} from "../../../../Redux/action/loadDataSuccess";
import { addExtMetaCol} from "../../../../Redux/action/loadColumns";

const TableHeadCell = (props) => {


    const { col } = props;
    let clickRef = React.useRef(null);
    const dispatch = useDispatch();
    const dispatchContext = (context) => {
        dispatch(addContext(context));
    }
    const dispatchSelectCol = (colName) => {
        dispatch(selectColumn(colName))
    }
    const dispatchDeselectCol = (colName) => {
        dispatch(deselectColumn(colName))
    }
    const dispatchDeleteCol = (colName) => {
        dispatch(deleteColumn(colName))
    }
    const dispatchRemoveContext = () => {
        dispatch(removeContext());
    }
    const dispatchExtendColMeta = (colName, reconciliator) => {
        dispatch(extendColMeta(colName, reconciliator));
    }
    const dispatchAddExtMetaCol = (name, colType, extendedCol) => {
        dispatch(addExtMetaCol(name, colType, extendedCol));
    }

    const displayContextMenu = (e, col) => {
        e.preventDefault();
        // let bounds = clickRef.current.getBoundingClientRect();
        let xPos = e.clientX // - bounds.left;
        let yPos = e.clientY // - bounds.top;
        const contextProps = {
            xPos,
            yPos,
            type: "headerContext",
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

    const handleRef = (r) => {
        clickRef.current = r;
    };



    return (
        <>
            {
                col.type === 'dataCol' &&
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
            {   col.type === 'indexCol' &&
                <div>
                    {col.label}
                </div>

            }
            {
                col.type === 'extMetaCol' &&
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