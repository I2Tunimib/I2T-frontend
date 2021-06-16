import style from "./ContextEffect.module.css";
import { removeContext } from "../../Redux/action/contextMenu";
import { useDispatch, useSelector } from "react-redux";
import ContextMenu from "../../SharedComponents/ContextMenu/ContextMenu";
import { RootState } from "../../Redux/store";

const ContextEffect = () => {
    const dispatch = useDispatch();
    const OpenedContext = useSelector((state: RootState) => state.Context);
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
                <ContextMenu xPos={OpenedContext.xPos} yPos={OpenedContext.yPos} items={OpenedContext.items} type={OpenedContext.type}  />
            }
        </>
    )
}

export default ContextEffect;