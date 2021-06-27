import ErrorEffect from "../ErrorEffect/ErrorEffect";
import LoadingEffect from "../LoadingEffect/LoadingEffect";
import LoadedDataEffect from "../LoadedDataEffect/LoadedDataEffect";
import ContextEffect from "../ContextEffect/ContextEffect";
import EditableCellEffect from "../EditableCellEffect/EditableCellEffect";
import ReconciliateEffect from "../ReconciliateEffect/ReconciliateEffect";
import FilterDataEffect from "../FilterDataEffect/FilterDataEffect";

const AllEffects = () => {
    return (
        <>
        <ErrorEffect/>
        <LoadingEffect/>
        <LoadedDataEffect/>
        <ContextEffect />
        <EditableCellEffect />
        <ReconciliateEffect/>
        <FilterDataEffect/>
        </>
    )
}

export default AllEffects;