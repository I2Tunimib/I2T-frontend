import React from "react";
import { useSelector } from "react-redux";
import ExtendFromCell from "./ExtendFromCell/ExtendFromCell";

const Cell = (props) => {
    const { dataIndex, keyName, rowIndex, rowsPerPage, pageIndex  } = props;

    const LoadedData = useSelector(state => state.LoadedData);
    const ToExtendCols = useSelector(state => state.ToExtendCols);
    const HasExtended = useSelector(state => state.HasExtended);

    const [itHasToExt, setItHasToExt] = React.useState(false);


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

    return (
        <div>
            {cellValue}
            {
                itHasToExt && keyName==="LOCALITA" &&
                <ExtendFromCell keyName={keyName} dataIndex={dataIndex}/>
            }
        </div>
    )
}

export default Cell;