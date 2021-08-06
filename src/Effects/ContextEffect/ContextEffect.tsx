import style from "./ContextEffect.module.css";
import { removeContext } from "../../Redux/action/contextMenu";
import { useDispatch, useSelector } from "react-redux";
import ContextMenu from "../../SharedComponents/ContextMenu/ContextMenu";
import { RootState } from "../../Redux/store";

const ContextEffect = () => {

    //context effect listen for changes in the Context part of the state 
    // if there is a context open a context menu in the given position with the given items
    // items objects can be found in ./src/ContextItems and are dispatched in the state by different components


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