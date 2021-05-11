import style from "./ContextEffect.module.css";
import { removeContext } from "../../Redux/action/openContext";
import { useDispatch, useSelector } from "react-redux";
import ContextMenu from "../../SharedComponents/ContextMenu/ContextMenu";

const ContextEffect = () => {
    const dispatch = useDispatch();
    const OpenedContext = useSelector(state => state.OpenedContext);
    const removeContextDispatch = () => {
        dispatch(removeContext());
    }



    return (
        <>
            {
                OpenedContext &&
                <div className={style.contextOverlay} onClick={(e) => { removeContextDispatch(); e.preventDefault(); e.stopPropagation() }}>

                </div>
            }

            {
                OpenedContext &&
                <ContextMenu properties={OpenedContext} />
            }
        </>
    )
}

export default ContextEffect;