import React from "react";
import {useSelector, useDispatch} from "react-redux";
import MainButton from "../../../../../SharedComponents/MainButton/MainButton";
import { reconciliate} from "../../../../../Redux/action/reconciliate";

const ReconcileCol = () => {
    const LoadedColumns = useSelector(state => state.LoadedColumns);
    const LoadedData = useSelector(state => state.LoadedData);
    const [selectedColumns, setSelectedColumns] = React.useState([]);


    const dispatch = useDispatch();

    const dispatchReconciliate = (payload) => {
        dispatch(reconciliate(payload));
    }


    React.useEffect(()=>{
        const selectedColumns = [];
        for (const col of LoadedColumns){
            if(col.selected){
                selectedColumns.push(col);
            }
        }
        setSelectedColumns(selectedColumns);
    }, [LoadedColumns])


    const reconciliatePayload = () => {
        const payLoad = []
        for (let i = 0; i < LoadedData.length; i++){
            for (const col of selectedColumns) {
                payLoad.push({
                    column: col.name,
                    index: i, 
                    label: LoadedData[i][col.name].label,
                })
            }
        }
        dispatchReconciliate(payLoad);
    }

    /*const riconciliate = () =>{
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
    }*/

    return(
        <>
        {
            selectedColumns.length >= 1 &&
            <MainButton label='Riconcilia' cta={()=>{reconciliatePayload()}}/>
        }
        </>
    )
};


export default ReconcileCol;