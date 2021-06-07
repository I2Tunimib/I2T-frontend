import React from "react";
import {useSelector, useDispatch} from "react-redux";
import MainButton from "../../../../../SharedComponents/MainButton/MainButton";
import DropdownModal from "../../../../../SharedComponents/DropdownModal/DropdownModal";
import {getAllReconciliator, reconciliate} from "../../../../../Http/httpServices";
import {displayError} from "../../../../../Redux/action/error";
import {addMetadata} from "../../../../../Redux/action/loadDataSuccess";
import {setLoadingState, unsetLoadingState} from "../../../../../Redux/action/loading"; 

const ReconcileCol = () => {
    const LoadedColumns = useSelector(state => state.LoadedColumns);
    const LoadedData = useSelector(state => state.LoadedData);
    const LoadedName = useSelector(state => state.LoadedName)
    const [selectedColumns, setSelectedColumns] = React.useState([]);
    const [modalIsOpen, setModalIsOpen] = React.useState(false);
    const [reconciliators, setReconciliators] = React.useState([]);
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


    React.useEffect(()=>{
        const selectedColumns = [];
        for (const col of LoadedColumns){
            if(col.selected){
                selectedColumns.push(col);
            }
        }
        setSelectedColumns(selectedColumns);
    }, LoadedColumns)

    React.useEffect(()=>{
        (async ()=>{
            const respReconciliators = await getAllReconciliator();
            if (respReconciliators.status === 200) {
                const reconciliators = respReconciliators.data.reconciliators;
                setReconciliators(reconciliators);
            } else {
                dispatchError('Impossible to connect to riconciliator service');
            }
        })()
    }, [])

    const payload = () => {
        const payLoad = {
            name: LoadedName,
            items: [],
        }
        for (let i = 0; i < LoadedData.length; i++){
            for (const col of selectedColumns) {
                payLoad.items.push({
                    column: col.name,
                    index: i, 
                    label: LoadedData[i][col.name].label,
                })
            }
        }
        return payLoad;
    }

    const riconciliate = () =>{
        dispatchLoadingState();
        setModalIsOpen(false);
        (async ()=> {
            const reqPayload = payload();
            const reconResponse = await reconciliate(selectedRecon.value, reqPayload)
            if (await reconResponse.status === 200) {
                if(reconResponse.data.error){
                    dispatchNoLoadingState()
                    dispatchError(reconResponse.data.error);
                    return;
                }
                console.log(reconResponse.data);
                for (const item of reconResponse.data.items){
                    console.log(item.metadata);
                    dispatchMeta(item.column, item.index, item.metadata);
                }
                dispatchNoLoadingState();
            } else {
                dispatchNoLoadingState();
                dispatchError('Impossible to connect to riconciliator service');
            }
        })()
    }

    return(
        <>
        {
            selectedColumns.length >= 1 &&
            <MainButton label='Riconcilia' cta={()=>{setModalIsOpen(true)}}/>
        }
        {
            modalIsOpen && 
            <DropdownModal
            inputLabel="Seleziona"
            titleText="Riconcilia colonne"
            text="Seleziona una API con cui riconciliare le colonne selezionate"
            mainButtonLabel="Conferma"
            mainButtonAction={()=>{riconciliate()}}
            secondaryButtonLabel="Annulla"
            secondaryButtonAction={() => setModalIsOpen(false)}
            showState={modalIsOpen}
            inputValues={reconciliators}
            onClose={()=>{setModalIsOpen(false)}}
            setInputValue={(recon)=>{setSelectedRecon(recon)}}
            />
        }
        </>
    )
};


export default ReconcileCol;