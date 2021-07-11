import { useSelector, useDispatch } from "react-redux";
import React from "react";
import { RootState } from "../../../../../Redux/store";
import MainButton from "../../../../../SharedComponents/MainButton/MainButton";
import { colInterface } from "../../../../../Interfaces/col.interface";
import ExtendModal from "../../../../../SharedComponents/ExtendModal/ExtendModal";
import { metaService } from "../../../../../Http/httpServices";
import { setLoadingState, unsetLoadingState } from "../../../../../Redux/action/loading";
import { extensionServiceInterface } from "../../../../../Interfaces/configInterface";
import { loadDataSuccess, loadSavedDataSuccess } from "../../../../../Redux/action/data";
import { loadColumns } from "../../../../../Redux/action/columns";
import { cellTypeEnum } from "../../../../../Enums/cell-type.enum";
import { displayError } from "../../../../../Redux/action/error";

const ExtendTable = () => {
    const Columns = useSelector((state: RootState) => state.Columns);
    const Data = useSelector((state: RootState) => state.Data)
    const [isExtensible, setIsExtensible] = React.useState<boolean>(false);
    const [selectedCol, setSelectedCol] = React.useState<colInterface | null>(null)
    const [extendDialogIsOpen, setExtendDialogIsOpen] = React.useState<boolean>(false);

    const dispatch = useDispatch();

    const dispatchLoadingState = () => {
        dispatch(setLoadingState());
    }

    const dispatchError = (error: string) => {
        dispatch(displayError(error))
    }

    const dispatchNoLoadingState = () => {
        dispatch(unsetLoadingState());
    }

    const dispatchLoadData = (data: any) => {
        dispatch(loadSavedDataSuccess(data));
    }
    const dispatchColumns = (columns: colInterface[]) => {
        dispatch(loadColumns(columns));
    }

    React.useEffect(() => {
        const selectedAndReconciliated = [];
        for (const col of Columns) {
            if (col.reconciliated && col.selected) {
                selectedAndReconciliated.push(col);
            }
        }
        if (selectedAndReconciliated.length === 1) {
            setIsExtensible(true);
            setSelectedCol(selectedAndReconciliated[0]);
        } else {
            setIsExtensible(false);
            setSelectedCol(null);
        }
    }, [Columns])

    const callExtendService = (paramsToSend: any, internalUrl: string, extendConfig: extensionServiceInterface, matchingCols: { colname: string, matchinParam: string }[]) => {
        dispatchLoadingState();
        (async () => {
            const extensionResponse = await metaService(internalUrl, paramsToSend);
            if(await !extensionResponse.error) {
            const keys = Object.keys(extensionResponse.data);
            const newData = [...Data];
            const propsKeys = Object.keys(extensionResponse.data[keys[0]]);
            for (const propKey of propsKeys) {
                let colName = matchingCols[0].colname + '_' + propKey;
                for (const key of keys) {
                    // const matchingValue = extensionResponse.data[key];
                    //const propsKeys = Object.keys(extensionResponse.data[key]);
                    for (let i = 0; i < newData.length; i++) {
                        let matchingId = null;
                        for (const metaItem of newData[i][matchingCols[0].colname].metadata) {
                            if (metaItem.match) {
                                matchingId = metaItem.id;
                            }
                        }
                        if (matchingId === key) {
                            const newRow = JSON.parse(JSON.stringify(newData[i]));
                            newRow[colName] = {
                                ids: [extensionResponse.data[key][propKey][0].id],
                                label: extensionResponse.data[key][propKey][0].name,
                                metadata: [{
                                    id: extensionResponse.data[key][propKey][0].id,
                                    name: extensionResponse.data[key][propKey][0].name,
                                    score: 100,
                                    match: true,
                                }],
                                type: cellTypeEnum.data,
                            }
                            newData[i] = newRow;
                            // extensionResponse.data[key][propKey];
                        }
                    }
                }
                dispatchLoadData(newData);
                dispatchColumns([...Columns, {
                    label: colName,
                    name: colName,
                    selected: false,
                    type: cellTypeEnum.data,
                    reconciliated: true,
                    reconciliator: extendConfig.name,
                    new: true,
            }])
            }
            } else {
                dispatchError(extensionResponse.errorText);
            }
            dispatchNoLoadingState();
        })()
    }



    return (
        <>
            {
                isExtensible &&
                <>
                    <MainButton
                        label="Estendi"
                        cta={() => { setExtendDialogIsOpen(true) }}
                    />
                </>
            }
            {extendDialogIsOpen &&
                <ExtendModal
                    titleText={`Estendi colonna ${selectedCol!.label}`}
                    text={'Inserisci le opzioni di estensione'}
                    mainButtonAction={(paramsToSend: any, internalUrl: string, extendConfig: extensionServiceInterface, matchingCols: { colname: string, matchinParam: string }[]) => {
                        callExtendService(paramsToSend, internalUrl, extendConfig, matchingCols);
                        setExtendDialogIsOpen(false)
                    }}
                    mainButtonLabel={'Conferma'}
                    secondaryButtonAction={() => { setExtendDialogIsOpen(false) }}
                    secondaryButtonLabel={'Annulla'}
                    showState={extendDialogIsOpen}
                    onClose={() => { setExtendDialogIsOpen(false) }}
                />
            }
        </>
    )
}

export default ExtendTable;