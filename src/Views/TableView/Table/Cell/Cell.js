import React from "react";
import { useSelector, useDispatch } from "react-redux";
import ExtendFromCell from "./ExtendFromCell/ExtendFromCell";
import {addEditableCell} from "../../../../Redux/action/editableCell";
import {addContext, removeContext} from "../../../../Redux/action/openContext";

const Cell = (props) => {
    const { dataIndex, keyName, rowIndex, rowsPerPage, pageIndex  } = props;

    const LoadedData = useSelector(state => state.LoadedData);
    const ToExtendCols = useSelector(state => state.ToExtendCols);
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


    const cellValue = LoadedData[dataIndex][keyName];

    const checkIfHasToBeExtensible = () => {
            for (const extCol of ToExtendCols) {
                //USED WORKARAUND HERE
                if ((/*extCol.matchingcol == keyName*/true) && (extCol.rowIndex == dataIndex)) {
                    console.log(rowIndex);
                    setItHasToExt(true);

                    return;
                }
            } 
            setItHasToExt(false);
    }

    React.useEffect(() => {

         if(HasExtended) {
            checkIfHasToBeExtensible();
        }
        
    }, [HasExtended, pageIndex, rowsPerPage, ToExtendCols])

    const handleRef = (r) => {
        clickRef.current = r;
    };

    const displayContextMenu = (e) => {
        console.log("ciao");
        e.preventDefault();
        let xPos = e.clientX // - bounds.left;
        let yPos = e.clientY // - bounds.top;
        const contextProps = {
            xPos, 
            yPos, 
            type:"cellContext",
            items: [{
                icon:"",
                label:"Modifica",
                action: () => {
                    dispatchEditableCell(dataIndex, keyName);
                    dispatchRemoveContext();
                }
            }]
        }
        dispatchContext(contextProps);
    }

    return (
        <div onContextMenu={(e)=>{displayContextMenu(e)}} ref={(r) => {handleRef(r)}} onClick={()=>{dispatchRemoveContext()}}>
            {cellValue}
            {
                itHasToExt && keyName==="LOCALITA" &&
                <ExtendFromCell keyName={keyName} dataIndex={dataIndex}/>
            }
        </div>
    )
}

export default Cell;