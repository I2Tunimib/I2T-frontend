import { FC, ReactNode } from "react";
import { createPortal } from "react-dom";

interface TooltipPortalProps {
  children: ReactNode;
}

const TooltipPortal: FC<TooltipPortalProps> = ({ children }) => {
  // Create or get the tooltip container
  let tooltipContainer = document.getElementById("svg-tooltip-container");

  if (!tooltipContainer) {
    tooltipContainer = document.createElement("div");
    tooltipContainer.id = "svg-tooltip-container";
    tooltipContainer.style.position = "absolute";
    tooltipContainer.style.top = "0";
    tooltipContainer.style.left = "0";
    tooltipContainer.style.pointerEvents = "none";
    tooltipContainer.style.zIndex = "10000";
    document.body.appendChild(tooltipContainer);
  }

  return createPortal(children, tooltipContainer);
};

export default TooltipPortal;
