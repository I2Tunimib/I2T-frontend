import useSvgCoordinator, {
  UseSvgCoordinatorProps,
} from "@hooks/svg/useSvgCoordinator";
import {
  FC,
  useEffect,
  useState,
  HTMLAttributes,
  forwardRef,
  Ref,
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
    ref,
  ) => {
    console.log("*** SVG paths ***", paths);
    const { processedPaths, draw } = useSvgCoordinator({
      svgRef: ref,
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
        if (ref.current) {
          const tableContainer = ref.current.closest(".TableContainer");
          if (tableContainer) {
            setContainerScrollLeft(tableContainer.scrollLeft);
          }
        }
      };

      // Initial update
      updateScrollPosition();

      // Set up listener for scroll events
      if (ref.current) {
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
    return (
      <svg ref={ref} {...props}>
        {processedPaths &&
          processedPaths.map((path: any, index: number) => {
            // Extract start and end element labels from the group key
            const [startElementLabel, endElementLabel] = path.group.split("-");

            return (
              <SvgArrow
                key={`${path.id}_${index}`}
                id={`${path.id}_${index}`}
                d={path.path.draw()}
                arrowId={`${index}`}
                direction={path.direction}
                color={path.color}
                label={path.label}
                link={path.link}
                showLabel={true}
                showTooltip={false}
                startElementLabel={startElementLabel}
                endElementLabel={endElementLabel}
                onMouseEnter={() => onPathMouseEnter && onPathMouseEnter(path)}
                onMouseLeave={onPathMouseLeave}
              />
            );
          })}
      </svg>
    );
  },
);

export default SvgPathCoordinator;
