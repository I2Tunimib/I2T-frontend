import clsx from "clsx";
import { FC, HTMLAttributes } from "react";
import styles from "./ButtonShortcut.module.scss";
import { Tooltip } from "@mui/material";

interface ButtonShortcutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Text to display in the button.
   */
  text?: string;
  tooltipText?: string;
  size?: "s" | "xs";
  variant?: "flat" | "raised";
  color?: "standard" | "green" | "darkgreen" | "blue" | "darkblue" | "white";
}

/**
 * Small button symbol.
 */
const ButtonShortcut: FC<ButtonShortcutProps> = ({
  text = "CTRL",
  tooltipText,
  size = "s",
  variant = "raised",
  color = "standard",
  className,
}) => {
  return (
    <Tooltip title={tooltipText ?? ""} placement="top">
      <div
        className={clsx(
          styles.Container,
          {
            [styles.xs]: size === "xs",
            [styles.Raised]: variant === "raised",
            [styles.Green]: color === "green",
            [styles.DarkGreen]: color === "darkgreen",
            [styles.Blue]: color === "blue",
            [styles.DarkBlue]: color === "darkblue",
            [styles.White]: color === "white",
          },
          className
        )}
      >
        {text}
      </div>
    </Tooltip>
  );
};

export default ButtonShortcut;
