import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {displayError} from "../../Redux/action/error";
import {addMetadata} from "../../Redux/action/loadDataSuccess";
import {setLoadingState, unsetLoadingState} from "../../Redux/action/loading"; 
import DropdownModal from "../../SharedComponents/DropdownModal/DropdownModal";
import {reconciliateService} from "../../Http/httpServices";
import ClassicModal from "../../SharedComponents/ClassicModal/ClassicModal";
import { noReconciliate} from "../../Redux/action/reconciliate";
import {reconciliatedCol, addExtMetaCol} from "../../Redux/action/loadColumns";


const ReconciliateEffect = () => {

    const ItemsToReconciliate = useSelector(state => state.ItemsToReconciliate);
    const Reconciliators = useSelector(state => state.Reconciliators);
    const LoadedName = useSelector(state => state.LoadedName)
    const [reconciliatorsModalIsOpen, setReconciliatorsModalIsOpen] = React.useState(false)
    const [isProcessOk, setIsProcessOk] = React.useState(false);
    const [selectedRecon, setSelectedRecon] = React.useState();

    const dispatch = useDispatch();

    const dispatchError = (err) => {
        dispatch(displayError(err))
    }
    const dispatchMeta = (colName, index, metadata) => {
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
    const dispatchReconciliatedCol = (name, reconciliator) => {
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
            const reconResponse = await reconciliateService(selectedRecon.value, reqPayload)
            if (await reconResponse.status === 200) {
                if(reconResponse.data.error){
                    dispatchNoLoadingState()
                    dispatchError(reconResponse.data.error);
                    dispatchNoReconciliate();
                    return;
                }
                const reconciliatedCol = [];
                for (const item of reconResponse.data.items){
                    dispatchMeta(item.column, item.index, item.metadata);
                    if (!reconciliatedCol.includes(item.column)) {
                        console.log(item.column);
                        reconciliatedCol.push(item.column);
                        console.log(selectedRecon);
                        dispatchReconciliatedCol(item.column, selectedRecon.label);
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
            setInputValue={(recon)=>{setSelectedRecon(recon)}}
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