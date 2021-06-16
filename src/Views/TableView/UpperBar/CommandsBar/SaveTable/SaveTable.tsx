import MainButton from "../../../../../SharedComponents/MainButton/MainButton"
import SecondaryButton from "../../../../../SharedComponents/SecondaryButton/SecondaryButton";
import style from "./SaveTable.module.css";
import {useSelector, useDispatch} from "react-redux";
import {saveTable} from "../../../../../Http/httpServices";
import {setLoadingState, unsetLoadingState} from "../../../../../Redux/action/loading";
import {displayError} from "../../../../../Redux/action/error";
import ClassicModal from "../../../../../SharedComponents/ClassicModal/ClassicModal";
import InputModal from "../../../../../SharedComponents/InputModal/InputModal";
import React from "react";
import { RootState } from "../../../../../Redux/store";

const SaveTable = () => {
    const LoadedData = useSelector((state: RootState )=> state.Data);
    const LoadedName = useSelector((state: RootState) => state.Name);
    const [okModalIsOpen, setOkModalIsOpen] = React.useState(false);
    const [saveAsModalIsOpen, setSaveAsModalIsOpen] = React.useState(false);
    const [saveAsName, setSaveAsName] = React.useState <string>(LoadedName);

    const dispatch = useDispatch();

    const dispatchSetLoadingState = () => {
        dispatch(setLoadingState());
    }

    const dispatchUnsetLoadingState = () => {
        dispatch(unsetLoadingState());
    }    

    const dispatchError = (err: string) => {
        dispatch(displayError(err));
    }

    
    const save = (name = LoadedName) => {
        dispatchSetLoadingState();
        (async () => {
            const response = await saveTable(LoadedData, name);
            if (await response.error) {
                dispatchUnsetLoadingState();
                dispatchError(response.errorText)
            } else {
                dispatchUnsetLoadingState();
                setOkModalIsOpen(true);
            }
        })()
        
    }

    const saveAs =() => {
        setSaveAsName(LoadedName);
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
            value={saveAsName}
            secondaryButtonAction={() => setSaveAsModalIsOpen(false)}
            onClose={()=>{setSaveAsModalIsOpen(false)}}
            showState={saveAsModalIsOpen}
            setInputValue={(value: string)=> {setSaveAsName(value)}}
            />
        }
        </>

    )
}

export default SaveTable;