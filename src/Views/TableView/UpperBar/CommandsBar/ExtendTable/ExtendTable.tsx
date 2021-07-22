import { useSelector, useDispatch } from "react-redux";
import React from "react";
import { RootState } from "../../../../../Redux/store";
import MainButton from "../../../../../SharedComponents/MainButton/MainButton";
import { colInterface } from "../../../../../Interfaces/col.interface";
import ExtendModal from "../../../../../SharedComponents/ExtendModal/ExtendModal";
import { metaService } from "../../../../../Http/httpServices";
import { setLoadingState, unsetLoadingState } from "../../../../../Redux/action/loading";
import { extensionServiceInterface, selectColModeEnum } from "../../../../../Interfaces/configInterface";
import { loadSavedDataSuccess } from "../../../../../Redux/action/data";
import { loadColumns } from "../../../../../Redux/action/columns";
import { cellTypeEnum } from "../../../../../Enums/cell-type.enum";
import { displayError } from "../../../../../Redux/action/error";
import { useTranslation } from "react-i18next";

const ExtendTable = () => {
    const Columns = useSelector((state: RootState) => state.Columns);
    const Data = useSelector((state: RootState) => state.Data)
    const [isExtensible, setIsExtensible] = React.useState<boolean>(false);
    const [selectedCol, setSelectedCol] = React.useState<colInterface | null>(null)
    const [extendDialogIsOpen, setExtendDialogIsOpen] = React.useState<boolean>(false);
    const { t } = useTranslation();

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

    const callExtendService = (paramsToSend: any, internalUrl: string, extendConfig: extensionServiceInterface, matchingCols: { colname: string, selectColMode: selectColModeEnum, matchinParam: string }[]) => {
        dispatchLoadingState();
        (async () => {
            const extensionResponse = await metaService(internalUrl, paramsToSend);
            if (await !extensionResponse.error) {
                if (extensionResponse.data.items.length === 0) {
                    dispatchError("Il sistema non ha riportato nessun dato per l'estensione")
                } else {
                    const newData = [...Data];
                    // first af all i add columns
                    let itemCounter = 0;
                    const reallyTrueProps: string[] = [];
                    let reallyNewColBaseName = '';
                    for (const item of extensionResponse.data.items) {
                        itemCounter = itemCounter + 1;
                        const propsKeys = Object.keys(extensionResponse.data.items[0]);
                        let rowIndex = undefined;
                        for (let i = 0; i < newData.length; i++) {
                            const isGoodIndex = [];
                            for (const matchingCol of matchingCols) {
                                if (matchingCol.selectColMode === selectColModeEnum.LABELS) {
                                    if (item[matchingCol.matchinParam] === newData[i][matchingCol.colname].label) {
                                        isGoodIndex.push(true);
                                    }
                                } else if (matchingCol.selectColMode === selectColModeEnum.IDS) {
                                    let myId = undefined;
                                    if (newData[i][matchingCol.colname]) {
                                        for (const meta of newData[i][matchingCol.colname].metadata) {
                                            if (meta.match === true) {
                                                myId = meta.id;
                                                if (myId === '6557942') {
                                                    console.log('eccolo');
                                                }
                                            }
                                        }
                                    }


                                    if (item[matchingCol.matchinParam] === myId) {
                                        isGoodIndex.push(true);
                                        if (myId === '6557942') {
                                            console.log('pusho true');
                                        }
                                    }
                                }
                            }
                            if (isGoodIndex.length === matchingCols.length) {
                                rowIndex = i;
                                if (i === 1) {
                                    console.log('setto rowIndex');
                                }
                            }
                        }
                        if (rowIndex !== undefined) {
                            let myNewColBaseName = '';
                            for (const matchingCol of matchingCols) {
                                myNewColBaseName = myNewColBaseName + matchingCol.colname + "_";
                            }
                            if (!reallyNewColBaseName) {
                                reallyNewColBaseName = myNewColBaseName;
                            }

                            const trueProps = propsKeys.filter((prop) => {
                                let isTrue = true;
                                for (const matchingCol of matchingCols) {
                                    if (prop === matchingCol.matchinParam) {
                                        isTrue = false
                                    }
                                }
                                if (isTrue) {
                                    return true;
                                } else {
                                    return false;
                                }
                            })
                            for (const prop of trueProps) {
                                if (!reallyTrueProps.includes(prop)) {
                                    reallyTrueProps.push(prop);
                                }
                                if (typeof item[prop] === "string") {
                                    const newLine = { ...newData[rowIndex] };
                                    newLine[`${myNewColBaseName}${prop}`] = {
                                        label: item[prop],
                                        metadata: [],
                                        type: cellTypeEnum.data,
                                        reconciliator: '',
                                    }
                                    newData[rowIndex] = newLine;
                                } else if (typeof item[prop] === "object") {
                                    const newLine = { ...newData[rowIndex] };
                                    newLine[`${myNewColBaseName}${prop}`] = {
                                        label: item[prop].name,
                                        metadata: [item[prop]],
                                        type: cellTypeEnum.data,
                                    }
                                    newData[rowIndex] = newLine;
                                }
                                /*if (itemCounter === 0) {
                                    console.log('ciao')
                                    let alreadyAdded = false;
                                    for (const col of Columns) {
                                        if (col.name === `${myNewColBaseName}${prop}`) {
                                            console.log('ciao1');
                                            alreadyAdded = true;
                                        }
                                    }
                                    if(!alreadyAdded) {
                                        console.log('ciao2')
                                    }
                                    if (!alreadyAdded) {
                                        dispatchColumns([...Columns, {
                                            label: `${myNewColBaseName}${prop}`,
                                            name: `${myNewColBaseName}${prop}`,
                                            selected: false,
                                            type: cellTypeEnum.data,
                                            reconciliated: true,
                                            reconciliator: extendConfig.name,
                                            new: true,
                                        }])
                                    }

                                }*/
                            }
                        }
                    }
                    dispatchLoadData(newData);
                    console.log(reallyTrueProps);
                    const newColumns = reallyTrueProps.filter((prop) => {
                        let alreadyExist = false;
                        for (const col of Columns) {
                            if (col.name === `${reallyNewColBaseName}${prop}`) {
                                alreadyExist = true;
                            }
                        }
                        if (alreadyExist) {
                            return false;
                        } else {
                            return true;
                        }
                    }).map((prop) => {
                        return (
                            {
                                label: `${reallyNewColBaseName}${prop}`,
                                name: `${reallyNewColBaseName}${prop}`,
                                selected: false,
                                type: cellTypeEnum.data,
                                reconciliated: true,
                                reconciliator: extendConfig.name,
                                new: true,
                                metadata: [],
                            }
                        )
                    })
                    dispatchColumns([...Columns, ...newColumns])
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
                        label={t('commands-bar.extension.button-label')}
                        cta={() => { setExtendDialogIsOpen(true) }}
                    />
                </>
            }
            {extendDialogIsOpen &&
                <ExtendModal
                    titleText={`${t('commands-bar.extension.extension-modal.title-text')}`}
                    text={t('commands-bar.extension.extension-modal.text')}
                    mainButtonAction={(paramsToSend: any, internalUrl: string, extendConfig: extensionServiceInterface, matchingCols: { colname: string, selectColMode: selectColModeEnum, matchinParam: string }[]) => {
                        callExtendService(paramsToSend, internalUrl, extendConfig, matchingCols);
                        setExtendDialogIsOpen(false)
                    }}
                    mainButtonLabel={t('buttons.confirm')}
                    secondaryButtonAction={() => { setExtendDialogIsOpen(false) }}
                    secondaryButtonLabel={t('buttons.cancel')}
                    showState={extendDialogIsOpen}
                    onClose={() => { setExtendDialogIsOpen(false) }}
                />
            }
        </>
    )
}

export default ExtendTable;