import { useSelector, useDispatch } from "react-redux";
import React from "react";
import { RootState } from "../../../../../Redux/store";
import MainButton from "../../../../../SharedComponents/MainButton/MainButton";
import { colInterface } from "../../../../../Interfaces/col.interface";
import ExtendModal from "../../../../../SharedComponents/ExtendModal/ExtendModal";

const ExtendTable = () => {
    const Columns = useSelector((state: RootState )=> state.Columns);
    const [isExtensible, setIsExtensible] = React.useState<boolean>(false);
    const [selectedCol, setSelectedCol] = React.useState<colInterface | null>(null)
    const [extendDialogIsOpen, setExtendDialogIsOpen] = React.useState<boolean>(false);

    React.useEffect(() => {
        const selectedAndReconciliated = [];    
        for (const col of Columns) {
            if (col.reconciliated && col.selected) {
                selectedAndReconciliated.push(col);
            }
        }
        if(selectedAndReconciliated.length === 1) {
            setIsExtensible(true);
            setSelectedCol(selectedAndReconciliated[0]);
        } else {
            setIsExtensible(false);
            setSelectedCol(null);
        }
    }, [Columns])


    
    return (
        <>
        {
            isExtensible &&
            <>
            <MainButton
            label="Estendi Colonna Selezionata"
            cta={() => {setExtendDialogIsOpen(true)}}
            />
            </>
        }
        {   extendDialogIsOpen &&
            <ExtendModal
            titleText={`Estendi colonna ${selectedCol!.label}`}
            text={'Inserisci le opzioni di estensione'}
            mainButtonAction={() => {}}
            mainButtonLabel={'Conferma'}
            secondaryButtonAction={()=>{setExtendDialogIsOpen(false)}}
            secondaryButtonLabel={'Annulla'}
            showState={extendDialogIsOpen}
            onClose={()=>{setExtendDialogIsOpen(false)}}
            />
        }
        </>
    )
}

export default ExtendTable;