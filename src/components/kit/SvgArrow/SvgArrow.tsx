import { FC, useState, useRef, useEffect } from "react";
import { ArrowHead } from "../SvgComponents";
import styles from "./SvgArrow.module.scss";
import TooltipPortal from "./TooltipPortal";

interface SvgArrowProps {
  id: string;
  arrowId: string;
  d: string;
  direction: "start" | "end";
  color?: string;
  label?: string | string[];
  link?: string;
  showLabel?: boolean;
  showTooltip?: boolean;
  startElementLabel?: string;
  endElementLabel?: string;
  onMouseEnter?: (data: any) => void;
  onMouseLeave?: () => void;
  adjustedLabelPosition?: { x: number; y: number };
  onLabelRef?: (id: string, element: SVGTextElement | null) => void;
}

const SvgArrow: FC<SvgArrowProps> = ({
  id,
  arrowId,
  d,
  direction,
  color = "black",
  label,
  link,
  showLabel = true,
  showTooltip = false,
  startElementLabel,
  endElementLabel,
  onMouseEnter,
  onMouseLeave,
  adjustedLabelPosition,
  onLabelRef,
}) => {
  const pathRef = useRef<SVGPathElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [labelHovering, setLabelHovering] = useState(false);
  const [labelPosition, setLabelPosition] = useState({ x: 0, y: 0 });
  const [labelViewportPosition, setLabelViewportPosition] = useState({
    x: 0,
    y: 0,
  });
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

  // Calculate label position at the highest point of the curve
  useEffect(() => {
    if (pathRef.current) {
      const totalLength = pathRef.current.getTotalLength();

      // Use adjusted position if provided, otherwise calculate the highest point
      if (adjustedLabelPosition) {
        setLabelPosition({
          x: adjustedLabelPosition.x,
          y: adjustedLabelPosition.y,
        });
      } else {
        // Sample points along the curve to find the highest (minimum y) point
        let highestPoint = pathRef.current.getPointAtLength(0);
        const sampleCount = 50;

        for (let i = 0; i <= sampleCount; i++) {
          const point = pathRef.current.getPointAtLength(
            (i / sampleCount) * totalLength,
          );
          if (point.y < highestPoint.y) {
            highestPoint = point;
          }
        }

        setLabelPosition({ x: highestPoint.x, y: highestPoint.y - 10 }); // 10px above highest point
      }
    }
  }, [d, adjustedLabelPosition]); // Recalculate when path or adjusted position changes

  // Calculate label viewport position for tooltip
  useEffect(() => {
    if (textRef.current) {
      const rect = textRef.current.getBoundingClientRect();
      setLabelViewportPosition({ x: rect.left + rect.width / 2, y: rect.top });
    }
  }, [labelPosition]); // Recalculate when label position changes

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
          <path
            id={id}
            ref={pathRef}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth="1"
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
            strokeWidth="1"
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
        {/* Show label at the top of the arrow */}
        {label && showLabel && (
          <text
            ref={(el) => {
              textRef.current = el;
              onLabelRef && onLabelRef(id, el);
            }}
            key={`label-${id}`}
            x={labelPosition.x + 15}
            y={labelPosition.y}
            textAnchor="middle"
            style={{ cursor: "pointer", fontSize: "12px", fill: "black" }}
            onMouseEnter={() => setLabelHovering(true)}
            onMouseLeave={() => setLabelHovering(false)}
          >
            {Array.isArray(label) ? label[0] : label}
          </text>
        )}
      </g>

      {/* Tooltip rendered outside SVG using portal for arrow hover */}
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
                <div className={styles.TooltipText}>
                  Relation: {Array.isArray(label) ? label.join(", ") : label}
                </div>
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

      {/* Tooltip for multiple labels on label hover */}
      {label && Array.isArray(label) && label.length > 1 && labelHovering && (
        <TooltipPortal>
          <div
            className={styles.PortalTooltip}
            style={{
              position: "fixed",
              left: labelViewportPosition.x + 15, // Offset from label
              top: labelViewportPosition.y - 40, // Above label
              zIndex: 10000,
              pointerEvents: "none",
            }}
          >
            <div className={styles.TooltipBackground}>
              <div className={styles.TooltipContent}>
                <div className={styles.TooltipText}>Relations:</div>
                {label.map((l, i) => (
                  <div key={i} className={styles.TooltipText}>
                    {l}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TooltipPortal>
      )}
    </>
  );
};

export default SvgArrow;
