import ErrorEffect from "../ErrorEffect/ErrorEffect";
import LoadingEffect from "../LoadingEffect/LoadingEffect";
import LoadedDataEffect from "../LoadedDataEffect/LoadedDataEffect";
import ContextEffect from "../ContextEffect/ContextEffect";
import HasExtendedEffect  from "../HasExtendedEffect/HasExtendedEffect";

const AllEffects = () => {
    return (
        <>
        <HasExtendedEffect/>
        <ErrorEffect/>
        <LoadingEffect/>
        <LoadedDataEffect/>
        <ContextEffect />
        </>
    )
}

export default AllEffects;