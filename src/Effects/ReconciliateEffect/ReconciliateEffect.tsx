import React, { SetStateAction } from "react";
import {useDispatch, useSelector} from "react-redux";
import {displayError} from "../../Redux/action/error";
import {addMetadata} from "../../Redux/action/data";
import {setLoadingState, unsetLoadingState} from "../../Redux/action/loading"; 
import DropdownModal from "../../SharedComponents/DropdownModal/DropdownModal";
import {reconciliateService} from "../../Http/httpServices";
import ClassicModal from "../../SharedComponents/ClassicModal/ClassicModal";
import { noReconciliate} from "../../Redux/action/reconciliate";
import {reconciliatedCol, addExtMetaCol} from "../../Redux/action/columns";
import { RootState } from "../../Redux/store";
import { reconciliatorInterface } from "../../Interfaces/reconciliator.interface";


const ReconciliateEffect = () => {

    const ItemsToReconciliate = useSelector((state: RootState) => state.ItemsToReconciliate);
    const Reconciliators = useSelector((state: RootState) => state.Reconciliators);
    const LoadedName = useSelector((state: RootState) => state.Name)
    const [reconciliatorsModalIsOpen, setReconciliatorsModalIsOpen] = React.useState(false)
    const [isProcessOk, setIsProcessOk] = React.useState(false);
    const [selectedRecon, setSelectedRecon] = React.useState <reconciliatorInterface>();

    const dispatch = useDispatch();

    const dispatchError = (err: string) => {
        dispatch(displayError(err))
    }
    const dispatchMeta = (colName: string, index: number, metadata: any) => {
        dispatch(addMetadata(colName, index, metadata))
    }
    const dispatchLoadingState = () => {
        dispatch(setLoadingState());
    }
    const dispatchNoLoadingState = () => {
        dispatch(unsetLoadingState());
    }
    const dispatchNoReconciliate = () => {
        dispatch(noReconciliate())
    }
    const dispatchReconciliatedCol = (name: string, reconciliator: string) => {
        dispatch(reconciliatedCol(name, reconciliator))
    }



    React.useEffect(()=>{
        if(ItemsToReconciliate.length >= 1){
            setIsProcessOk(false);
            setReconciliatorsModalIsOpen(true);
        } else {
            setIsProcessOk(false);
            setReconciliatorsModalIsOpen(false);
        }
    }, [ItemsToReconciliate])

    const riconciliate = () =>{
        dispatchLoadingState();
        setReconciliatorsModalIsOpen(false);
        (async ()=> {
            const reqPayload = {
                name: LoadedName,
                items: ItemsToReconciliate,
            }
            const reconResponse = await reconciliateService(selectedRecon!.value, reqPayload)
            if (await !reconResponse.error) {
                console.log(reconResponse);
                const reconciliatedCol: string[] = [];
                for (const item of reconResponse.data.items){
                    dispatchMeta(item.column, item.index, item.metadata);
                    if (!reconciliatedCol.includes(item.column)) {
                        console.log(item.column);
                        reconciliatedCol.push(item.column);
                        console.log(selectedRecon);
                        dispatchReconciliatedCol(item.column, selectedRecon!.label);
                        // dispatchAddExtMetaCol(`${item.column}(${selectedRecon})`, "extMetaCol", item.column);
                    }
                }
                dispatchNoLoadingState();
                setIsProcessOk(true);
                dispatchNoReconciliate();
            } else {
                dispatchNoLoadingState();
                dispatchError('Impossible to connect to riconciliator service');
                dispatchNoReconciliate();
            }
        })()
    }

    return (
        <>
            {
            reconciliatorsModalIsOpen && 
            <DropdownModal
            inputLabel="Seleziona"
            titleText="Riconcilia colonne"
            text="Seleziona una API con cui riconciliare le colonne selezionate"
            mainButtonLabel="Conferma"
            mainButtonAction={()=>{riconciliate()}}
            secondaryButtonLabel="Annulla"
            secondaryButtonAction={() => setReconciliatorsModalIsOpen(false)}
            showState={reconciliatorsModalIsOpen}
            inputValues={Reconciliators}
            onClose={()=>{setReconciliatorsModalIsOpen(false)}}
            setInputValue={(recon: SetStateAction <reconciliatorInterface | undefined>)=>{setSelectedRecon(recon)}}
            />
        }
        {
            isProcessOk &&
            <ClassicModal
            titleText="Ok"
            text="Riconciliazione avvenuta con successo"
            mainButtonLabel="Ok"
            mainButtonAction={()=>{setIsProcessOk(false)}}
            showState={isProcessOk}
            onClose={()=>{setIsProcessOk(false)}}
            />
        }        
        </>
    )
}

export default ReconciliateEffect;