import style from "./CommandsBar.module.css";
import SaveTable from "./SaveTable/SaveTable";
import ReconcileCol from "./ReconcileCol/ReconcileCol";
import ExtendTable from "./ExtendTable/ExtendTable";
import LanguageDropdown from "./LanguageDropdown/LanguageDropdown";

const CommandsBar = () => {
    return (

        <div className={style.commandsBar}>
            <div>
                <ReconcileCol/>
                <ExtendTable/>
            </div>
            <div>
                <SaveTable/>
                <LanguageDropdown/>
            </div>
        </div>
    )
}

export default CommandsBar;