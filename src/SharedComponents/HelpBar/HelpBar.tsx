import LanguageDropdown from "../../Views/TableView/UpperBar/CommandsBar/LanguageDropdown/LanguageDropdown"
import HelpModal from "../HelpModal/HelpModal"

const HelpBar = () => {
    return (
        <>
        <div className='help-bar'>
            <LanguageDropdown/>
            <HelpModal/>
        </div>
        </>
    )
}

export default HelpBar;