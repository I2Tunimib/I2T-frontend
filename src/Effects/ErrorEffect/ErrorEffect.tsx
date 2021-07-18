import { useSelector, useDispatch } from "react-redux";
import React from "react";
import ClassicModal from "../../SharedComponents/ClassicModal/ClassicModal";
import { noError } from "../../Redux/action/error";
import { RootState } from "../../Redux/store";
import { useTranslation } from 'react-i18next';

const ErrorEffect = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const error = useSelector((state: RootState) => state.Error);
    const [show, setShow] = React.useState(false);

    React.useEffect(() => {
        if (error === false) {
            setShow(false);
        } else {
            setShow(true);
        }
    }, [error]);

    const dispatchNoError = () => {
        dispatch(noError());
    }


    return (
        <>
            <ClassicModal
                titleText={t('shared.error.title-text')}
                text={error.toString()}
                mainButtonLabel={t('buttons.close')}
                mainButtonAction={dispatchNoError}
                showState={show}
                onClose={dispatchNoError} />
        </>
    )
}

export default ErrorEffect;