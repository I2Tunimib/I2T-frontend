
import React from "react";
import style from "./ContextMenu.module.css";


const ContextMenu = (props) => {
    const { properties } = props;
    const { xPos, yPos, items } = properties;

    const dropItems = items.map((item) => {
        console.log(item.icon);
        return (
            <li onClick={(e) => { item.action() }} key={item.label}>
                {
                    item.icon &&
                    <div>
                       {item.icon}
                    </div>
                }

                <p>
                    {item.label}
                </p>
            </li>
        )
    })

    const findContextCoord = () => {
        return [xPos, yPos];
    }


    return (
        <>

            <div style={{ position: "absolute", top: findContextCoord()[1], left: findContextCoord()[0] }} className={style.contextMenu}>
                <ul>
                    {dropItems}
                </ul>
            </div>
        </>
    )
}

export default ContextMenu;