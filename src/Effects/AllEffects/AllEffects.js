import ErrorEffect from "../ErrorEffect/ErrorEffect";
import LoadingEffect from "../LoadingEffect/LoadingEffect";
import LoadedDataEffect from "../LoadedDataEffect/LoadedDataEffect";
import ContextEffect from "../ContextEffect/ContextEffect";

const AllEffects = () => {
    return (
        <>
        <ErrorEffect/>
        <LoadingEffect/>
        <LoadedDataEffect/>
        <ContextEffect />
        </>
    )
}

export default AllEffects;