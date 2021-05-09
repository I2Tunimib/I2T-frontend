import React from "react";
import InputModal from "../SharedComponents/InputModal/InputModal";
import { useSelector, useDispatch } from "react-redux";
import { loadName } from "../Redux/action/nameLoad";
import { deleteData } from "../Redux/action/loadDataSuccess";
import { Redirect , Route} from "react-router-dom";

const LoadedDataEffect = () => {
    const LoadedData = useSelector(state => state.LoadedData);
    const  LoadedName = useSelector(state => state.LoadedName);
    const dispatch = useDispatch();
    // const history = useHistory();
    const [dataHasBeenLoaded, setDataHasBeenLoaded] = React.useState(false);
    const [tableName, setTableName] = React.useState("");
    const [isConfirmed, setIsConfirmed] = React.useState(false);


    const dispatchName = (name) => {
        dispatch(loadName(name));
    }

    const dispatchDeleteData = () => {
        dispatch(deleteData());
    }

    const confirmAction = () => {
        dispatchName(tableName);
        setIsConfirmed(true);
        setDataHasBeenLoaded(false);
    }

    React.useEffect(() => {
        if (LoadedData.length >= 1 && !LoadedName) {
            setDataHasBeenLoaded(true);
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
            }}/>
            }
        </>
    )
}

export default LoadedDataEffect;