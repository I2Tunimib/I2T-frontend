/* eslint-disable react/destructuring-assignment */
import clsx from "clsx";
import { FC, HTMLAttributes } from "react";
import { Tooltip } from "@mui/material";
import styles from "./ButtonShortcut.module.scss";

interface ButtonShortcutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Text to display in the button.
   */
  text?: string;
  tooltipText?: string;
  size?: "s" | "xs";
  variant?: "flat" | "raised";
  color?:
    | "standard"
    | "green"
    | "darkgreen"
    | "blue"
    | "darkblue"
    | "white"
    | "teal"
    | "crimson"
    | "orange";
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
  ...rest
}) => {
  // Inline styles for new colors (keeps appearance consistent with existing palette)
  const colorStyle =
    color === "teal"
      ? { background: "#d8f3f0", color: "#0b6b63" }
      : color === "crimson"
        ? { background: "#fde0e3", color: "#9b0f15" }
        : color === "orange"
          ? { background: "#fde8bc", color: "#da6d00" }
          : undefined;
  return (
    <Tooltip title={tooltipText ?? ""} placement="bottom">
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
          className,
        )}
        style={colorStyle}
        {...rest}
      >
        {text}
      </div>
    </Tooltip>
  );
};

export default ButtonShortcut;
