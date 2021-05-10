import React from "react";
import InputModal from "../../SharedComponents/InputModal/InputModal";
import { useSelector, useDispatch } from "react-redux";
import { loadName } from "../../Redux/action/loadName";
import { deleteData } from "../../Redux/action/loadDataSuccess";
import { Redirect } from "react-router-dom";
import { loadColumns } from "../../Redux/action/loadColumns";

const LoadedDataEffect = () => {
    // this effect componente triggers when data has been loaded, and ask for name an load columns
    const LoadedData = useSelector(state => state.LoadedData);
    const LoadedName = useSelector(state => state.LoadedName);
    const dispatch = useDispatch();
    // const history = useHistory();
    const [dataHasBeenLoaded, setDataHasBeenLoaded] = React.useState(false);
    const [tableName, setTableName] = React.useState("");
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

    const confirmAction = () => {
        dispatchName(tableName);
        setIsConfirmed(true);
        setDataHasBeenLoaded(false);
    }

    const setColumns = () => {
        let keys = [];
        for (let i = 0; i < LoadedData.length; i++) {
            if (Object.keys(LoadedData[i]).length > keys.length) {
                keys  = Object.keys(LoadedData[i]).map((key)=>{
                    return {
                        label: key,
                        name: key,
                        selected: false,
                    }
                })
            }
        }
        return keys;
    }

    React.useEffect(() => {
        if (LoadedData.length >= 1 && !LoadedName) {
            setDataHasBeenLoaded(true);
            dispatchColumns(setColumns());
        } else {
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
                    mainButtonAction={confirmAction}
                    setInputValue={(name) => { setTableName(name) }}
                    secondaryButtonLabel={"Annulla Caricamento"}
                    secondaryButtonAction={dispatchDeleteData}
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