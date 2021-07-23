import React from "react";
import {useSelector, useDispatch} from "react-redux";
import MainButton from "../../../../../SharedComponents/MainButton/MainButton";
import { reconciliate} from "../../../../../Redux/action/reconciliate";
import { RootState } from "../../../../../Redux/store";
import { colInterface } from "../../../../../Interfaces/col.interface";
import { useTranslation } from "react-i18next";

const ReconcileCol = () => {
    const LoadedColumns = useSelector((state: RootState) => state.Columns);
    const LoadedData = useSelector((state: RootState )=> state.Data);
    const [selectedColumns, setSelectedColumns] = React.useState <colInterface[]>([]);
    const {t} = useTranslation();


    const dispatch = useDispatch();

    const dispatchReconciliate = (payload: any) => {
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
            for (const col of selectedColumns!) {
                payLoad.push({
                    column: col.name,
                    index: i, 
                    // TODO da vedere questa cosa
                    label: LoadedData[i][col.name].label ? LoadedData[i][col.name].label.replaceAll("/", " ").replaceAll('&', " ") : '',
                })
            }
        }
        //console.log(payLoad);
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
                //console.log(reconResponse.data);
                for (const item of reconResponse.data.items){
                    //console.log(item.metadata);
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
            <MainButton label={t('commands-bar.reconciliation.button-label')} cta={()=>{reconciliatePayload()}}/>
        }
        </>
    )
};


export default ReconcileCol;