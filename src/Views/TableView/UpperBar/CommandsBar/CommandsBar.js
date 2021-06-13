import style from "./CommandsBar.module.css";
import SaveTable from "./SaveTable/SaveTable";
import ReconcileCol from "./ReconcileCol/ReconcileCol";

const CommandsBar = () => {
    return (
        <div className={style.commandsBar}>
            <ReconcileCol/>
            <SaveTable/>
        </div>
    )
}

export default CommandsBar;