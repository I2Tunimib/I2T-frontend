import useSvgCoordinator, {
  UseSvgCoordinatorProps,
} from "@hooks/svg/useSvgCoordinator";
import { FC, useEffect, useState, HTMLAttributes } from "react";
import SvgArrow from "../SvgArrow";

export interface SvgPathCoordinatorProps
  extends UseSvgCoordinatorProps,
    HTMLAttributes<SVGSVGElement> {
  shouldRedraw?: () => boolean;
  onPathMouseEnter?: (id: string) => void;
  onPathMouseLeave?: () => void;
  showRelationTooltips?: boolean;
}

const SvgPathCoordinator: FC<SvgPathCoordinatorProps> = ({
  paths,
  shouldRedraw,
  onPathMouseEnter,
  onPathMouseLeave,
  showRelationTooltips = true,
  ...props
}) => {
  const { svgRef, processedPaths, draw } = useSvgCoordinator({
    paths,
    options: {
      alfa: 30,
    },
  });

  // Store scrollLeft to adjust viewBox
  const [containerScrollLeft, setContainerScrollLeft] = useState(0);

  // Update scroll position whenever visible
  useEffect(() => {
    const updateScrollPosition = () => {
      if (svgRef.current) {
        const tableContainer = svgRef.current.closest(".TableContainer");
        if (tableContainer) {
          setContainerScrollLeft(tableContainer.scrollLeft);
        }
      }
    };

    // Initial update
    updateScrollPosition();

    // Set up listener for scroll events
    if (svgRef.current) {
      const tableContainer = svgRef.current.closest(".TableContainer");
      if (tableContainer) {
        tableContainer.addEventListener("scroll", updateScrollPosition);
        return () => {
          tableContainer.removeEventListener("scroll", updateScrollPosition);
        };
      }
    }
  }, [svgRef.current]);

  // Always force a redraw when the component mounts
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(() => {
      draw();
    }, 0);
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

  return (
    <svg ref={svgRef} {...props}>
      {processedPaths &&
        processedPaths.map((path: any, index: number) => (
          <SvgArrow
            key={`${path.id}_${index}`}
            id={`${path.id}_${index}`}
            d={path.path.draw()}
            arrowId={`${index}`}
            direction={path.direction}
            color={path.color}
            label={path.label}
            link={path.link}
            showLabel={!showRelationTooltips}
            showTooltip={showRelationTooltips}
            startElementLabel={path.startElementLabel}
            endElementLabel={path.endElementLabel}
            onMouseEnter={() =>
              onPathMouseEnter &&
              onPathMouseEnter({
                ...path,
                startColumn: path.startElementLabel,
                endColumn: path.endElementLabel,
                relationName: path.label,
              })
            }
            onMouseLeave={onPathMouseLeave}
          />
        ))}
    </svg>
  );
};

export default SvgPathCoordinator;
