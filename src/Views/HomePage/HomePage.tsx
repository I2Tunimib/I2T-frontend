import Tutorial from "./Tutorial/Tutorial";
import GetData from "./GetData/GetData";
import InitialEffect from "../../Effects/InitialEffect/InitialEffect";
import React from "react";


const HomePage: React.FC = () => {
    return(
        <>
        <InitialEffect/>
        <Tutorial/>
        <GetData/>
        </>
    )
}

export default HomePage;