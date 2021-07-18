import ErrorEffect from "../ErrorEffect/ErrorEffect";
import LoadingEffect from "../LoadingEffect/LoadingEffect";
import ContextEffect from "../ContextEffect/ContextEffect";
import EditableCellEffect from "../EditableCellEffect/EditableCellEffect";
import ReconciliateEffect from "../ReconciliateEffect/ReconciliateEffect";
import FilterDataEffect from "../FilterDataEffect/FilterDataEffect";

const AllEffects = () => {
    return (
        <>
        <ErrorEffect/>
        <LoadingEffect/>
        <ContextEffect />
        <EditableCellEffect />
        <ReconciliateEffect/>
        <FilterDataEffect/>
        </>
    )
}

export default AllEffects;