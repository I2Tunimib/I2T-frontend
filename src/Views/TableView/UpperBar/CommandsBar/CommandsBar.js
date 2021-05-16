import ExtendTable from "./ExtendTable/ExtendTable";
import style from "./CommandsBar.module.css";
import SaveTable from "./SaveTable/SaveTable";

const CommandsBar = () => {
    return (
        <div className={style.commandsBar}>
            <ExtendTable/>
            <SaveTable/>
        </div>
    )
}

export default CommandsBar;