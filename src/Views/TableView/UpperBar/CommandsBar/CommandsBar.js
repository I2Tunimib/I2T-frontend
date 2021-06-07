import ExtendTable from "./ExtendTable/ExtendTable";
import style from "./CommandsBar.module.css";
import SaveTable from "./SaveTable/SaveTable";
import ReconcileCol from "./ReconcileCol/ReconcileCol";

const CommandsBar = () => {
    return (
        <div className={style.commandsBar}>
            <ExtendTable/>
            <ReconcileCol/>
            <SaveTable/>
        </div>
    )
}

export default CommandsBar;