import { FC, HTMLAttributes, useState, useRef, useEffect } from "react";
import { ArrowHead } from "../SvgComponents";
import styles from "./SvgArrow.module.scss";

interface SvgArrowProps {
  id: string;
  arrowId: string;
  d: string;
  direction: "start" | "end";
  color?: string;
  label?: string;
  link?: string;
  showLabel?: boolean;
  showTooltip?: boolean;
  startElementLabel?: string;
  endElementLabel?: string;
  onMouseEnter?: (data: any) => void;
  onMouseLeave?: () => void;
}

const SvgArrow: FC<SvgArrowProps> = ({
  id,
  arrowId,
  d,
  direction,
  color = "black",
  label,
  link,
  showLabel = false,
  showTooltip = true,
  startElementLabel,
  endElementLabel,
  onMouseEnter,
  onMouseLeave,
}) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  // Handle mouse movement to update tooltip position
  const handleMouseMove = (e: React.MouseEvent) => {
    // Use requestAnimationFrame for smoother cursor following
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      // Get cursor position relative to the SVG element
      if (pathRef.current) {
        const svg = pathRef.current.ownerSVGElement;
        if (svg) {
          const point = svg.createSVGPoint();
          point.x = e.clientX;
          point.y = e.clientY;
          const transformedPoint = point.matrixTransform(
            svg.getScreenCTM()?.inverse(),
          );
          setCursorPosition({
            x: transformedPoint.x + 15,
            y: transformedPoint.y - 75,
          });
        }
      }
    });
  };

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      <defs>
        <ArrowHead id={arrowId} color={color} direction={direction} />
      </defs>
      <g
        className={styles.Arrow}
        onMouseEnter={() => {
          setIsHovering(true);
          onMouseEnter &&
            onMouseEnter({ id, label, startElementLabel, endElementLabel });
        }}
        onMouseLeave={() => {
          setIsHovering(false);
          onMouseLeave && onMouseLeave();
        }}
        onMouseMove={handleMouseMove}
      >
        <a href={link} target="_blank" rel="noreferrer">
          {/* Show either label on path or tooltip on hover based on props */}
          {label && showLabel && (
            <text key={`label-${id}`} dy="-5%">
              <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
                {label}
              </textPath>
            </text>
          )}

          {label && showTooltip && isHovering && (
            <g
              className={styles.TooltipContainer}
              transform={`translate(${cursorPosition.x}, ${cursorPosition.y})`}
            >
              {/* Tooltip pointer triangle */}
              <rect
                className={styles.TooltipBackground}
                x="-120"
                y="0"
                width="240"
                height="60"
                rx="4"
              />
              <path
                className={styles.TooltipPointer}
                d="M-5,0 L-15,-15 L5,-15 Z"
              />
              <text
                key={`tooltip-${id}`}
                className={styles.Tooltip}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                <tspan x="0" dy="20">
                  Relation: {label}
                </tspan>
                {startElementLabel && endElementLabel && (
                  <tspan x="0" dy="24">
                    {startElementLabel} → {endElementLabel}
                  </tspan>
                )}
              </text>
            </g>
          )}
          <path
            id={id}
            ref={pathRef}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth="2"
            {...(direction === "end"
              ? {
                  markerEnd: `url(#${arrowId})`,
                }
              : {
                  markerStart: `url(#${arrowId})`,
                })}
          />
          {/* Invisible wider path on top for easier hovering/clicking */}
          <path
            d={d}
            fill="none"
            stroke="transparent"
            strokeWidth="10"
            style={{ cursor: "pointer" }}
            onMouseEnter={() =>
              onMouseEnter &&
              onMouseEnter({ id, label, startElementLabel, endElementLabel })
            }
            onMouseLeave={() => {
              setIsHovering(false);
              onMouseLeave && onMouseLeave();
            }}
            onMouseMove={handleMouseMove}
          />
        </a>
      </g>
    </>
  );
};

export default SvgArrow;
