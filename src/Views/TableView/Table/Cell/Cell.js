import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {addEditableCell} from "../../../../Redux/action/editableCell";
import {addContext, removeContext} from "../../../../Redux/action/openContext";
import style from "./Cell.module.css";
import {editContext, extContext, deleteLineContext} from "../../../../ContextItems/ContextItems";
import {extendRow, extendedRow} from "../../../../Redux/action/extendRow";
import {deleteLine} from "../../../../Redux/action/loadDataSuccess"

const Cell = (props) => {
    const { dataIndex, keyName, rowsPerPage, pageIndex, lastDeletedCol, lastSortedCol} = props;
    
    const LoadedData = useSelector(state => state.LoadedData);
    const ToExtendRows = useSelector(state => state.ToExtendRows);
    const HasExtended = useSelector(state => state.HasExtended);

    const [itHasToExt, setItHasToExt] = React.useState(false);
    let clickRef = React.useRef(null);
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

    const modContext = editContext(dataIndex, keyName, dispatchEditableCell, dispatchRemoveContext)
    const extendContext = extContext(dataIndex, dispatchExtendRow, dispatchRemoveContext);
    const deleteRowContext = deleteLineContext(dataIndex, dispatchDeleteLine, dispatchRemoveContext);
    const [contextCellItems, setContextCellItems] = React.useState([modContext, deleteRowContext])

    // setting context at init 
    React.useEffect(()=>{
       if(HasExtended) {
        checkIfHasToBeExtensible();
       }
    }, [HasExtended, pageIndex, rowsPerPage, ToExtendRows])

    React.useEffect(()=>{
        if(itHasToExt){
            setContextCellItems([modContext, deleteRowContext, extendContext])
        } else {
            setContextCellItems([modContext, deleteRowContext]);
        }
    }, [itHasToExt])

    // const [cellValue, setCellValue] = React.useState(null);

    const cellValue = LoadedData[dataIndex] ? LoadedData[dataIndex][keyName]: null;

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
            type:"cellContext",
            items: contextCellItems,
        }
        dispatchContext(contextProps);
    }

    return (
        <div onContextMenu={(e)=>{displayContextMenu(e)}} ref={(r) => {handleRef(r)}} onClick={()=>{dispatchRemoveContext()}} className={style.cell}>
            {cellValue}
        </div>
    )
}
 
export default Cell;