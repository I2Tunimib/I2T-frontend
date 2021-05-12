import ExtendTable from "./ExtendTable/ExtendTable";
import style from "./CommandsBar.module.css";

const CommandsBar = () => {
    return (
        <div className={style.commandsBar}>
            <ExtendTable/>
        </div>
    )
}

export default CommandsBar;