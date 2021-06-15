import React from "react";
import InputModal from "../../SharedComponents/InputModal/InputModal";
import { useSelector, useDispatch } from "react-redux";
import { loadName } from "../../Redux/action/loadName";
import { deleteData, updateLine } from "../../Redux/action/loadDataSuccess";
import { Redirect } from "react-router-dom";
import { loadColumns } from "../../Redux/action/loadColumns";
import { displayError } from "../../Redux/action/error";

const LoadedDataEffect = () => {
    // this effect componente triggers when data has been loaded, and ask for name an load columns
    const LoadedData = useSelector(state => state.LoadedData);
    const LoadedName = useSelector(state => state.LoadedName);
    const LoadedColumns = useSelector(state => state.LoadedColumns);
    const dispatch = useDispatch();
    // const history = useHistory();
    const [dataHasBeenLoaded, setDataHasBeenLoaded] = React.useState(false);
    const [tableName, setTableName] = React.useState(LoadedName);
    const [isConfirmed, setIsConfirmed] = React.useState(false);


    const dispatchName = (name) => {
        dispatch(loadName(name));
    }

    const dispatchColumns = (columns) => {
        dispatch(loadColumns(columns));
    }

    const dispatchDeleteData = () => {
        dispatch(deleteData());
    }

    const dispatchUpdate = (index, line) => {
        dispatch(updateLine(index, line))
    }

    const confirmAction = () => {
        console.log(tableName);
        dispatchName(tableName);
        setIsConfirmed(true);
        setDataHasBeenLoaded(false);
    }

    const setColumns = () => {
        let keys = [];
        for (let i = 0; i < LoadedData.length; i++) {
            if (Object.keys(LoadedData[i]).length > keys.length) {
                keys = Object.keys(LoadedData[i]).filter(key => key !== 'index').map((key) => {
                        return {
                            label: key,
                            name: key,
                            selected: false,
                            type: 'dataCol',
                            riconciliated: false,
                        }
                })
            }
        }
        keys.unshift({
            label: "0",
            name: 'index',
            selected: false,
            type: 'indexCol',
            riconciliated: false,
        });
        // add first empty column
        return keys;
    }



    React.useEffect(() => {
        // reset index when loaded data changes
        // resetIndex();
        if (LoadedData.length >= 1  && LoadedColumns.length === 0) {
            setDataHasBeenLoaded(true);
            dispatchColumns(setColumns());
            setTableName(LoadedName);
        } else if (LoadedData.length === 0 && !LoadedColumns) {
            displayError("Error: data are empty");
            setDataHasBeenLoaded(false);
        }
    }, [LoadedData])

    return (
        <>
            { dataHasBeenLoaded && LoadedData &&
                <InputModal
                    titleText="La tua tabella è stata caricata"
                    inputLabel="Che nome vuoi dare alla tabella?"
                    mainButtonLabel={"Conferma"}
                    mainButtonAction={()=>{confirmAction()}}
                    setInputValue={(name) => { setTableName(name) }}
                    secondaryButtonLabel={"Annulla Caricamento"}
                    secondaryButtonAction={dispatchDeleteData}
                    value={LoadedName}
                    showState={dataHasBeenLoaded}
                    onClose={() => { setDataHasBeenLoaded(false) }}
                />
            }
            {   isConfirmed &&
                <Redirect to={{
                    pathname: "/table"
                }} />
            }
        </>
    )
}

export default LoadedDataEffect;