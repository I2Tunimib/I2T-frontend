import React from "react";
import {useSelector, useDispatch} from "react-redux";
import {loadColumns} from "../../Redux/action/loadColumns";

const HasExtendedEffect = () => {

    const HasExtended = useSelector(state => state.HasExtended);
    const LoadedColumns = useSelector(state => state.LoadedColumns);
    const LoadedData = useSelector(state => state.LoadedData);

    const dispatch = useDispatch();

    const dispatchColumns = (cols) => {
        dispatch(loadColumns(cols));
    }

    const setNewColumns = (dataSet) => {
        let colsLabel = [];
        const cols = [];
        //finding the most complete row to extract keys
        for (let i = 0; i < dataSet.length; i++) {
            if (Object.keys(dataSet[i]).length > colsLabel) {
                colsLabel = Object.keys(dataSet[i]);
            }
        }
        for (const label of colsLabel) {
            let labelExists = false;
            for (const previousCol of LoadedColumns) {
                // if columns already exists i take his data
                if (label === previousCol.name) {
                    labelExists = true;
                    cols.push({
                        label: previousCol.label,
                        name: previousCol.name,
                        selected: previousCol.selected
                    })
                    break;
                }
            }
            //else id create new
            if (!labelExists) {
                cols.push({
                    label: label,
                    name: label,
                    selected: false,
                })
            }
        }
        return cols;

    }

    React.useEffect(()=>{
        if(HasExtended){
            dispatchColumns(setNewColumns(LoadedData));
        } else {
            // do something
        }
    }, [HasExtended] )

    return (
        <>
        </>
    )
}

export default HasExtendedEffect;