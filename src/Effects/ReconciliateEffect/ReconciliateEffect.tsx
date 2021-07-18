import React, { SetStateAction } from "react";
import { useDispatch, useSelector } from "react-redux";
import { displayError } from "../../Redux/action/error";
import { addAllMetaData } from "../../Redux/action/data";
import { setLoadingState, unsetLoadingState } from "../../Redux/action/loading";
import DropdownModal from "../../SharedComponents/DropdownModal/DropdownModal";
import { metaService } from "../../Http/httpServices";
import ClassicModal from "../../SharedComponents/ClassicModal/ClassicModal";
import { noReconciliate } from "../../Redux/action/reconciliate";
import { reconciliatedCol } from "../../Redux/action/columns";
import { RootState } from "../../Redux/store";
import { reconciliatorInterface } from "../../Interfaces/reconciliator.interface";
import { metaResponseInterface } from "../../Interfaces/meta-response.interface";
import { useTranslation } from 'react-i18next';


const ReconciliateEffect = () => {
    const { t } = useTranslation();

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
            const reconResponse = await metaService(selectedRecon!.value, reqPayload)
            if (await !reconResponse.error) {
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
                dispatchError(t('shared.error.reconciliation.impossible-connect'));
                dispatchNoReconciliate();
            }
        })()
    }

    return (
        <>
            {
                reconciliatorsModalIsOpen &&
                <DropdownModal
                    inputLabel={t('commands-bar.reconciliation.select-reconciliator-modal.input-label')}
                    titleText={t('commands-bar.reconciliation.select-reconciliator-modal.title-text')}
                    text={t('commands-bar.reconciliation.select-reconciliator-modal.text')}
                    mainButtonLabel={t('buttons.confirm')}
                    mainButtonAction={() => { riconciliate() }}
                    secondaryButtonLabel={t('buttons.cancel')}
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
                    titleText={t('commands-bar.reconciliation.success-modal.title-text')}
                    text={t('commands-bar.reconciliation.success-modal.text')}
                    mainButtonLabel={t('buttons.close')}
                    mainButtonAction={() => { setIsProcessOk(false) }}
                    showState={isProcessOk}
                    onClose={() => { setIsProcessOk(false) }}
                />
            }
        </>
    )
}

export default ReconciliateEffect;