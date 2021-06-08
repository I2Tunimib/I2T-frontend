import ErrorEffect from "../ErrorEffect/ErrorEffect";
import LoadingEffect from "../LoadingEffect/LoadingEffect";
import LoadedDataEffect from "../LoadedDataEffect/LoadedDataEffect";
import ContextEffect from "../ContextEffect/ContextEffect";
import HasExtendedEffect  from "../HasExtendedEffect/HasExtendedEffect";
import EditableCellEffect from "../EditableCellEffect/EditableCellEffect";
import ExtendCellEffect from "../ExtendCellEffect/ExtendCellEffect";
import ReconciliateEffect from "../ReconciliateEffect/ReconciliateEffect";
const AllEffects = () => {
    return (
        <>
        <HasExtendedEffect/>
        <ErrorEffect/>
        <LoadingEffect/>
        <LoadedDataEffect/>
        <ContextEffect />
        <EditableCellEffect />
        <ExtendCellEffect/>
        <ReconciliateEffect/>
        </>
    )
}

export default AllEffects;