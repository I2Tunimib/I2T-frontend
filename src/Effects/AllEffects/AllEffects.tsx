import ErrorEffect from "../ErrorEffect/ErrorEffect";
import LoadingEffect from "../LoadingEffect/LoadingEffect";
import ContextEffect from "../ContextEffect/ContextEffect";
import ReconciliateEffect from "../ReconciliateEffect/ReconciliateEffect";
import FilterDataEffect from "../FilterDataEffect/FilterDataEffect";

const AllEffects = () => {
    return (
        <>
        <ErrorEffect/>
        <LoadingEffect/>
        <ContextEffect />
        <ReconciliateEffect/>
        <FilterDataEffect/>
        </>
    )
}

export default AllEffects;