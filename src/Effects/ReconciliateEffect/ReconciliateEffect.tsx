import React, { SetStateAction } from "react";
import { useDispatch, useSelector } from "react-redux";
import { displayError } from "../../Redux/action/error";
import { addAllMetaData } from "../../Redux/action/data";
import { setLoadingState, unsetLoadingState } from "../../Redux/action/loading";
import DropdownModal from "../../SharedComponents/DropdownModal/DropdownModal";
import { reconciliateService } from "../../Http/httpServices";
import ClassicModal from "../../SharedComponents/ClassicModal/ClassicModal";
import { noReconciliate } from "../../Redux/action/reconciliate";
import { reconciliatedCol, addExtMetaCol } from "../../Redux/action/columns";
import { RootState } from "../../Redux/store";
import { reconciliatorInterface } from "../../Interfaces/reconciliator.interface";
import { metaResponseInterface } from "../../Interfaces/meta-response.interface";


const ReconciliateEffect = () => {

    const ItemsToReconciliate = useSelector((state: RootState) => state.ItemsToReconciliate);
    //const reconciliatorsData = useSelector((state: RootState) => state.Config) ? useSelector((state: RootState) => state.Config).reconciliators : null;
    const Config = useSelector((state: RootState) => state.Config);
    const LoadedName = useSelector((state: RootState) => state.Name)
    const [reconciliatorsModalIsOpen, setReconciliatorsModalIsOpen] = React.useState(false)
    const [isProcessOk, setIsProcessOk] = React.useState(false);
    const [selectedRecon, setSelectedRecon] = React.useState<reconciliatorInterface>();
    const [reconciliators, setReconciliators] = React.useState<reconciliatorInterface[]>([]);

    const dispatch = useDispatch();

    const dispatchError = (err: string) => {
        dispatch(displayError(err))
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
    const dispatchMetaData = (responseMeta: metaResponseInterface) => {
        dispatch(addAllMetaData(responseMeta));
    }
    React.useEffect(() => {
        if (Config) {
            setReconciliators(Config.reconciliators.map((reconc: any) => {
                return ({
                    label: reconc.name,
                    value: reconc.relativeUrl,
                })
            }))
        }
    }, [Config])


    React.useEffect(() => {
        if (ItemsToReconciliate.length >= 1) {
            setIsProcessOk(false);
            setReconciliatorsModalIsOpen(true);
        } else {
            setIsProcessOk(false);
            setReconciliatorsModalIsOpen(false);
        }
    }, [ItemsToReconciliate])

    const riconciliate = () => {
        dispatchLoadingState();
        setReconciliatorsModalIsOpen(false);
        (async () => {
            const reqPayload = {
                name: LoadedName,
                items: ItemsToReconciliate,
            }
            const reconResponse = await reconciliateService(selectedRecon!.value, reqPayload)
            if (await !reconResponse.error) {
                console.log(reconResponse);
                dispatchMetaData(reconResponse.data);
                const reconciliatedCol: string[] = [];
                for (const item of reconResponse.data.items) {
                    // dispatchMeta(item.column, item.index, item.metadata);
                    if (!reconciliatedCol.includes(item.column)) {
                        // console.log(item.column);
                        reconciliatedCol.push(item.column);
                        // console.log(selectedRecon);
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
                    mainButtonAction={() => { riconciliate() }}
                    secondaryButtonLabel="Annulla"
                    secondaryButtonAction={() => setReconciliatorsModalIsOpen(false)}
                    showState={reconciliatorsModalIsOpen}
                    inputValues={reconciliators}
                    onClose={() => { setReconciliatorsModalIsOpen(false) }}
                    setInputValue={(recon: SetStateAction<reconciliatorInterface | undefined>) => { setSelectedRecon(recon) }}
                />
            }
            {
                isProcessOk &&
                <ClassicModal
                    titleText="Ok"
                    text="Riconciliazione avvenuta con successo"
                    mainButtonLabel="Ok"
                    mainButtonAction={() => { setIsProcessOk(false) }}
                    showState={isProcessOk}
                    onClose={() => { setIsProcessOk(false) }}
                />
            }
        </>
    )
}

export default ReconciliateEffect;