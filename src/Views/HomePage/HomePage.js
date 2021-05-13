import Tutorial from "./Tutorial/Tutorial";
import GetData from "./GetData/GetData";
import InitialEffect from "../../Effects/InitialEffect/InitialEffect";


const HomePage =  () => {
    return(
        <>
        <InitialEffect/>
        <Tutorial/>
        <GetData/>
        </>
    )
}

export default HomePage;