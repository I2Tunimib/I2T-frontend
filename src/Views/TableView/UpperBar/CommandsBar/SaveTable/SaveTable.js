import MainButton from "../../../../../SharedComponents/MainButton/MainButton"
import SecondaryButton from "../../../../../SharedComponents/SecondaryButton/SecondaryButton";
import style from "./SaveTable.module.css";
import {useSelector, useDispatch} from "react-redux";
import {saveTable, saveAsTable} from "../../../../../Http/httpServices";
import {setLoadingState, unsetLoadingState} from "../../../../../Redux/action/loading";
import {displayError} from "../../../../../Redux/action/error";
import ClassicModal from "../../../../../SharedComponents/ClassicModal/ClassicModal";
import InputModal from "../../../../../SharedComponents/InputModal/InputModal";
import React from "react";

const SaveTable = () => {
    const LoadedData = useSelector(state => state.LoadedData);
    const LoadedName = useSelector(state => state.LoadedName);
    const [okModalIsOpen, setOkModalIsOpen] = React.useState(false);
    const [saveAsModalIsOpen, setSaveAsModalIsOpen] = React.useState(false);
    const [saveAsName, setSaveAsName] = React.useState("");

    const dispatch = useDispatch();

    const dispatchSetLoadingState = () => {
        dispatch(setLoadingState());
    }

    const dispatchUnsetLoadingState = () => {
        dispatch(unsetLoadingState());
    }    

    const dispatchError = (err) => {
        dispatch(displayError(err));
    }

    
    const save = (name = LoadedName) => {
        dispatchSetLoadingState();
        (async () => {
            const response = await saveTable(LoadedData, name);
            if (response.status !== 200) {
                dispatchUnsetLoadingState();
                dispatchError(`Error: ${response.status}, ${response.statusText}`)
            } else {
                dispatchUnsetLoadingState();
                setOkModalIsOpen(true);
            }
        })()
        
    }

    const saveAs =() => {
        setSaveAsModalIsOpen(true);
    }


    return (
        <>
        <div className={style.saveDiv}>
            <SecondaryButton label="Salva con nome" cta={() => {saveAs()}}/>
            <MainButton label="Salva" cta ={() => {save()}}/>
        </div>
        {
            okModalIsOpen &&
            <ClassicModal 
            titleText="Salvataggio avvenuto con successo"
            text="La tua tabella è stata salvata con successo"
            mainButtonLabel="Ok"
            mainButtonAction={() => {setOkModalIsOpen(false)}}
            showState={okModalIsOpen}
            onClose = {() => setOkModalIsOpen(false)}
            />
        } {
            saveAsModalIsOpen && 
            <InputModal 
            titleText={"Salva con nome"}
            inputLabel="Scegli il nome con cui vuoi salvare la tua tabella:"
            mainButtonLabel="Conferma"
            mainButtonAction={ () => {save(saveAsName); setSaveAsModalIsOpen(false)}}
            secondaryButtonLabel="Annulla"
            secondaryButtonAction={() => setSaveAsModalIsOpen(false)}
            onClose={()=>{setSaveAsModalIsOpen(false)}}
            showState={saveAsModalIsOpen}
            setInputValue={(value)=> {setSaveAsName(value)}}
            />
        }
        </>

    )
}

export default SaveTable;