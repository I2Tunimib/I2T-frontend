import { FC, useCallback } from "react";

interface ArrowHeadProps {
  id: string;
  color: string;
  direction?: "start" | "end";
  orient?: string;
  size?: number;
}

const ArrowHead: FC<ArrowHeadProps> = ({
  color,
  size = 8,
  direction = "end",
  orient = "auto",
  ...props
}) => {
  return (
    <>
      {direction === "start" ? (
        <marker
          markerWidth="12"
          markerHeight="9"
          refX="6"
          refY="4.5"
          orient="auto"
          {...props}
        >
          <polygon points="12 0, 12 9, 0 4.5" fill={color} />
        </marker>
      ) : (
        <marker
          markerWidth="12"
          markerHeight="9"
          refX="6"
          refY="4.5"
          orient="auto"
          markerUnits="strokeWidth"
          {...props}
        >
          <polygon points="0 0, 12 4.5, 0 9" fill={color} />
        </marker>
      )}
    </>
  );
};

export default ArrowHead;
