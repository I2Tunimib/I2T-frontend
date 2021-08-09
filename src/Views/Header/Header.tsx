import { Link } from "react-router-dom";
import HelpBar from "../../SharedComponents/HelpBar/HelpBar";
import {ReactComponent as BackIcon} from "../../Assets/icon-set/back/back.svg";
import { useLocation } from 'react-router-dom'


const Header = () => {

    const location = useLocation();

    return (
        <>
            <div className='header'>
                <div className='header-left'>
                    {
                        location.pathname !== '/' &&
                        <div>
                        <Link to='/'>
                            <BackIcon />
                        </Link>
                    </div>
                    }
                    <div>
                        <h1>I2T4E</h1>
                        <h5>Interactive Interpretation of Tables for Extension</h5>
                    </div>

                </div>
                <HelpBar />
            </div>
        </>
    )
}

export default Header;