import SaveTable from "./SaveTable/SaveTable";
import ReconcileCol from "./ReconcileCol/ReconcileCol";
import ExtendTable from "./ExtendTable/ExtendTable";

const CommandsBar = () => {
    return (

        <div className='commands-bar'>
            <div>
                <ReconcileCol/>
                <ExtendTable/>
            </div>
            <div>
                <SaveTable/>
            </div>
        </div>
    )
}

export default CommandsBar;