import style from "./TableHeadCell.module.css";
import React from "react";
import {useDispatch} from "react-redux";
import {addContext} from "../../Redux/action/openContext";
import {selectColumn, deselectColumn, deleteColumn} from "../../Redux/action/loadColumns";

const TableHeadCell = (props) => {
   

    const {col} = props;
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
    const displayContextMenu = (e, col) =>{
        e.preventDefault();
        // let bounds = clickRef.current.getBoundingClientRect();
        let xPos = e.clientX // - bounds.left;
        let yPos = e.clientY // - bounds.top;
        let selectLabel = "";
        if(col.selected) {
            selectLabel = "Deseleziona";
        } else {
            selectLabel ="Seleziona"; 
        }
        const contextProps = {
            xPos,
            yPos,
            type: "headerContext",
            items: [{
                icon: "",
                label: selectLabel,
                action: ()=>{
                    if (col.selected) {
                        dispatchDeselectCol(col.name);
                    } else {
                        dispatchSelectCol(col.name);
                    }
                    // TODO remove also context
                } 
            }, {
                icon :"",
                label :"Nascondi",
                action: ()=>{
                    console.log(col);
                    // TODO remove also context
                }
            }, {
                icon :"",
                label :"Elimina",
                action: ()=>{
                    dispatchDeleteCol(col.name);
                    // TODO remove also context
                }
            }
            ]
        }
        dispatchContext(contextProps);
        
    }

    const handleRef = (r) => {
        clickRef.current = r;
    };



    return (
        <div className={style.headerCell} ref={(r) => {handleRef(r)}} onContextMenu={(e)=>{displayContextMenu(e, col)}}>
        <div className={style.statusCell}>
            {col.selected && 
                <p>Selezionata</p>
            }
        </div>
        <div className={style.accessorCell}>
            <p>
            {col.label}
            </p>
        </div>
        </div>
    )

}

export default TableHeadCell;