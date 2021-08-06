import ErrorEffect from "../ErrorEffect/ErrorEffect";
import LoadingEffect from "../LoadingEffect/LoadingEffect";
import ContextEffect from "../ContextEffect/ContextEffect";
import ReconciliateEffect from "../ReconciliateEffect/ReconciliateEffect";
import FilterDataEffect from "../FilterDataEffect/FilterDataEffect";

const AllEffects = () => {
    // this component groups all effects
    // effects are components that listen for changes in the state and make different things
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