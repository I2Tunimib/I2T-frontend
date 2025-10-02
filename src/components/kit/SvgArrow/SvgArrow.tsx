import { FC, HTMLAttributes, useState, useRef, useEffect } from "react";
import { ArrowHead } from "../SvgComponents";
import styles from "./SvgArrow.module.scss";
import TooltipPortal from "./TooltipPortal";

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
      // Calculate tooltip position relative to the viewport/document
      const newPosition = {
        x: e.clientX + 15, // Offset from cursor
        y: e.clientY - 40, // Position above cursor
      };

      console.log("SvgArrow - Mouse move position:", {
        clientX: e.clientX,
        clientY: e.clientY,
        calculatedPosition: newPosition,
        arrowId: id,
        label: label,
      });

      setCursorPosition(newPosition);
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
          console.log("SvgArrow - Mouse enter:", {
            id,
            label,
            showTooltip,
            startElementLabel,
            endElementLabel,
          });
          setIsHovering(true);
          onMouseEnter &&
            onMouseEnter({ id, label, startElementLabel, endElementLabel });
        }}
        onMouseLeave={() => {
          console.log("SvgArrow - Mouse leave:", { id, label });
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

          <path
            id={id}
            ref={pathRef}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth="10"
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
            strokeWidth="30"
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

      {/* Tooltip rendered outside SVG using portal */}
      {label && showTooltip && isHovering && (
        <TooltipPortal>
          <div
            className={styles.PortalTooltip}
            style={{
              position: "fixed",
              left: cursorPosition.x,
              top: cursorPosition.y,
              zIndex: 10000,
              pointerEvents: "none",
            }}
          >
            <div className={styles.TooltipBackground}>
              <div className={styles.TooltipContent}>
                <div className={styles.TooltipText}>Relation: {label}</div>
                {startElementLabel && endElementLabel && (
                  <div className={styles.TooltipText}>
                    {startElementLabel} → {endElementLabel}
                  </div>
                )}
              </div>
            </div>
          </div>
        </TooltipPortal>
      )}
    </>
  );
};

export default SvgArrow;
