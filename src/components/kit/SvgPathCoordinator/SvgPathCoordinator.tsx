import useSvgCoordinator, {
  UseSvgCoordinatorProps,
} from "@hooks/svg/useSvgCoordinator";
import {
  LabelBounds,
  smartAdjustLabels,
  AdjustedLabel,
} from "@services/utils/labelOverlapDetection";
import {
  FC,
  useEffect,
  useState,
  HTMLAttributes,
  forwardRef,
  Ref,
  RefObject,
  useRef,
  useCallback,
} from "react";
import SvgArrow from "../SvgArrow";

export interface SvgPathCoordinatorProps
  extends UseSvgCoordinatorProps,
    HTMLAttributes<SVGSVGElement> {
  shouldRedraw?: () => boolean;
  onPathMouseEnter?: (id: string) => void;
  onPathMouseLeave?: () => void;
  showRelationTooltips?: boolean;
}

const SvgPathCoordinator = forwardRef<SVGSVGElement, SvgPathCoordinatorProps>(
  (
    { paths, shouldRedraw, onPathMouseEnter, onPathMouseLeave, ...props },
    forwardedRef,
  ) => {
    console.log("*** SVG paths ***", paths);

    // Create a local ref to work with
    const localRef = useRef<SVGSVGElement>(null);
    const ref = (forwardedRef as RefObject<SVGSVGElement>) || localRef;

    const { processedPaths, draw } = useSvgCoordinator({
      svgRef: ref,
      paths,
      options: {
        alfa: 30,
      },
    });

    // Store scrollLeft to adjust viewBox
    const [containerScrollLeft, setContainerScrollLeft] = useState(0);

    // Store adjusted label positions
    const [adjustedLabels, setAdjustedLabels] = useState<
      Record<string, AdjustedLabel>
    >({});

    // Refs to track label elements
    const labelRefs = useRef<Record<string, SVGTextElement | null>>({});

    // Update scroll position whenever visible
    useEffect(() => {
      const updateScrollPosition = () => {
        if (ref && ref.current) {
          const tableContainer = ref.current.closest(".TableContainer");
          if (tableContainer) {
            setContainerScrollLeft(tableContainer.scrollLeft);
          }
        }
      };

      // Initial update
      updateScrollPosition();

      // Set up listener for scroll events
      if (ref && ref.current) {
        const tableContainer = ref.current.closest(".TableContainer");
        if (tableContainer) {
          tableContainer.addEventListener("scroll", updateScrollPosition);
          return () => {
            tableContainer.removeEventListener("scroll", updateScrollPosition);
          };
        }
      }
    }, [ref]);

    // Always force a redraw when the component mounts
    useEffect(() => {
      // Small delay to ensure DOM is fully rendered
      const timeoutId = setTimeout(() => {
        draw();
      }, 100);
      return () => clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
      if (shouldRedraw && shouldRedraw()) {
        // redraw when condition is met
        draw();
      }
    }, [shouldRedraw]);

    // Make sure to redraw when paths change
    useEffect(() => {
      if (Object.keys(paths || {}).length > 0) {
        draw();
      }
    }, [paths]);

    // Handle label ref callback
    const handleLabelRef = useCallback(
      (id: string, element: SVGTextElement | null) => {
        labelRefs.current[id] = element;
      },
      [],
    );

    // Detect and adjust label overlaps after paths are rendered
    const adjustLabels = useCallback(() => {
      if (
        !processedPaths ||
        processedPaths.length === 0 ||
        !ref ||
        !ref.current
      ) {
        return;
      }

      const labelBounds: LabelBounds[] = [];

      // Collect bounding boxes for all labels
      processedPaths.forEach((path: any, index: number) => {
        const labelId = `${path.id}_${index}`;
        const textElement = labelRefs.current[labelId];

        if (textElement && path.label) {
          try {
            const bbox = textElement.getBBox();

            // Get the current position from the text element
            const x = parseFloat(textElement.getAttribute("x") || "0");
            const y = parseFloat(textElement.getAttribute("y") || "0");

            // Text anchor is middle, so adjust x position
            const adjustedX = x - bbox.width / 2;
            const adjustedY = y - bbox.height;

            labelBounds.push({
              id: labelId,
              x: adjustedX,
              y: adjustedY,
              width: bbox.width,
              height: bbox.height,
              originalX: adjustedX,
              originalY: adjustedY,
            });
          } catch (error) {
            console.warn("Error getting label bounds:", error);
          }
        }
      });

      if (labelBounds.length > 0) {
        // Get SVG bounds for constraints
        const svgBounds =
          ref && ref.current ? ref.current.getBoundingClientRect() : null;
        const adjusted = smartAdjustLabels(
          labelBounds,
          svgBounds
            ? { width: svgBounds.width, height: svgBounds.height }
            : undefined,
        );

        // Convert to lookup map and adjust for text anchor middle
        const adjustedMap: Record<string, AdjustedLabel> = {};
        adjusted.forEach((label) => {
          const bounds = labelBounds.find((b) => b.id === label.id);
          if (bounds) {
            adjustedMap[label.id] = {
              id: label.id,
              x: label.x + bounds.width / 2, // Convert back to middle anchor
              y: label.y + bounds.height,
            };
          }
        });

        setAdjustedLabels(adjustedMap);
      }
    }, [processedPaths, ref]);

    // Adjust labels after rendering
    useEffect(() => {
      if (processedPaths && processedPaths.length > 0) {
        // Wait for labels to be rendered
        const timeoutId = setTimeout(() => {
          adjustLabels();
        }, 150);
        return () => clearTimeout(timeoutId);
      }
    }, [processedPaths, adjustLabels]);
    return (
      <svg ref={forwardedRef} {...props}>
        {processedPaths &&
          processedPaths.map((path: any, index: number) => {
            // Extract start and end element labels from the group key
            const [startElementLabel, endElementLabel] = path.group.split("-");
            const labelId = `${path.id}_${index}`;

            return (
              <g key={labelId}>
                <path
                  id={`${labelId}_path`}
                  d={path.path.draw()}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="0"
                  pointerEvents="none"
                />
                <SvgArrow
                  id={labelId}
                  d={path.path.draw()}
                  arrowId={`${index}`}
                  direction={path.direction}
                  color={path.color}
                  label={path.label}
                  link={path.link}
                  showLabel
                  showTooltip={false}
                  startElementLabel={startElementLabel}
                  endElementLabel={endElementLabel}
                  onMouseEnter={() =>
                    onPathMouseEnter && onPathMouseEnter(path)
                  }
                  onMouseLeave={onPathMouseLeave}
                  adjustedLabelPosition={adjustedLabels[labelId]}
                  onLabelRef={handleLabelRef}
                />
              </g>
            );
          })}
      </svg>
    );
  },
);

export default SvgPathCoordinator;
