import useWindowDimension from "@hooks/resize/useWindowResize";
import Path from "@services/classes";
import { bezierCurve, drawTo } from "@services/classes/PathOperators";
import { isEmptyObject } from "@services/utils/objects-utils";
import { current } from "immer";
import { useCallback, useEffect, useRef, useState, RefObject } from "react";

export interface UseSvgCoordinatorProps {
  svgRef: RefObject<SVGSVGElement>;
  paths: Record<string, CoordinatorPath[]>;
  options?: Partial<DrawOptions>;
}

export interface CoordinatorPath {
  id: string;
  startElementLabel: string;
  endElementLabel: string;
  startElement: HTMLElement;
  endElement: HTMLElement;
  label?: string | string[];
  link?: string;
}

export interface DrawOptions {
  minimumDistance: number;
  alfa: number;
}

const DEFAULT_OPTIONS = {
  minimumDistance: 15,
  alfa: 40,
};

const COLORS = [
  "#bd65a4",
  "#2fad96",
  "#7b439e",
  "#ff8a00",
  "#3682db",
  "#e74c3c",
  "#9b59b6",
  "#1abc9c",
  "#f39c12",
  "#34495e",
  "#16a085",
  "#8e44ad",
  "#e67e22",
  "#95a5a6",
  "#27ae60",
  "#d35400",
  "#2c3e50",
  "#f1c40f",
  "#3498db",
  "#e91e63",
];

/**
 * Anchor point of an element, in the svg own coordinate system.
 * Both rects are in viewport coordinates, so the result does not depend on
 * the scroll position (the svg scrolls together with the table).
 * `dx` spreads arrows attached to the same element.
 */
const getPoint = (
  element: HTMLElement,
  { top: svgTop = 0, left: svgLeft = 0 }: Partial<DOMRect>,
  dx: number = 0,
) => {
  const { left, top, width } = element.getBoundingClientRect();
  const x = left - svgLeft + width / 2 + dx;
  const y = top - svgTop;
  return [x, y];
};

const calcPointsDistances = (
  el1: HTMLElement,
  el2: HTMLElement,
  svgBoundingClientRect: DOMRect,
  dx1: number = 0,
  dx2: number = 0,
) => {
  const [x1, y1] = getPoint(el1, svgBoundingClientRect, dx1);
  const [x2, y2] = getPoint(el2, svgBoundingClientRect, dx2);

  // draw always in the same direction [left - right] so that
  // labels aren't flipped
  if (x1 > x2) {
    // if path from right to left, set starting point as p2
    return {
      p1: { x: x2, y: y2 },
      p2: { x: x1, y: y1 },
      distance: x1 - x2,
      direction: "start",
    };
  }
  return {
    p1: { x: x1, y: y1 },
    p2: { x: x2, y: y2 },
    distance: x2 - x1,
    direction: "end",
  };
};

const useSvgCoordinator = ({
  svgRef,
  paths,
  options,
}: UseSvgCoordinatorProps) => {
  const { minimumDistance, alfa } = { ...DEFAULT_OPTIONS, ...options };

  const [processedPaths, setProcessedPaths] = useState<any>();
  const { windowWidth } = useWindowDimension();

  const calcPaths = useCallback(
    (groupedPaths: any[], offset: number) => {
      let previousGroup = {
        group: "",
        horizontalOffset: 0,
      };

      // Total number of arrows for height calculation
      const totalArrows = groupedPaths.length;

      return groupedPaths.map(({ p1, p2, properties, ...rest }, index) => {
        const currentGroup = rest.group;
        const path = new Path(
          rest.direction === "end"
            ? { x: p1.x, y: p1.y }
            : { x: p1.x - 5, y: p1.y - 5 },
        );

        // SIMPLE GUARANTEED HEIGHT ORDERING:
        // Longest distance (index 0) = HIGHEST arc
        // Shortest distance (last index) = LOWEST arc
        // Strict descending order, no exceptions

        const minHeight = 20;
        const maxHeight = 230;
        const heightRange = maxHeight - minHeight;

        // Each arrow gets a guaranteed height based ONLY on its index
        // Larger index = shorter distance = lower height
        const heightStep = heightRange / Math.max(1, totalArrows - 1);
        const baseHeight = maxHeight - index * heightStep;

        // offset between each path (for arrows with same distance)
        const offsetPath = offset * (index + 1);

        // horizontal offset for control points of
        // the same group, so that paths don't stack one on top of the other
        const horizontalOffset =
          previousGroup.group === currentGroup
            ? previousGroup.horizontalOffset - alfa
            : 0;

        previousGroup = {
          group: currentGroup,
          horizontalOffset,
        };

        // Every arrow has its own arc height (see baseHeight), so no random
        // jitter is needed: it only made arcs and labels collide.
        const yOffset = baseHeight - 0.9 * horizontalOffset;

        path.pipe(
          bezierCurve(
            p1.x + horizontalOffset,
            p1.y - yOffset,
            p2.x,
            p2.y - yOffset,
          ),
          drawTo(
            rest.direction === "end" ? p2.x + 5 : p2.x,
            rest.direction === "end" ? p2.y - 5 : p2.y,
          ),
        );
        return {
          ...rest,
          path,
          label: properties.map((p: any) => p.label),
          link: properties[0]?.link, // Use first link or handle multiple
          id: properties[0]?.id, // Use first id
        };
      });
    },
    [alfa],
  );
  const draw = useCallback(() => {
    if (paths && !isEmptyObject(paths) && svgRef && svgRef.current) {
      // get svg bounding box to compute relative measures
      const svgBB = svgRef.current.getBoundingClientRect();
      // height of svg container
      const { height } = svgBB;
      // keep track of number of paths to draw
      // iterate on each group
      // each group contains a set of paths from the same source
      interface PathItem {
        properties: Array<{
          id: string;
          label?: string;
          link?: string;
        }>;
        id: string;
        color: string;
        group: string;
        p1: { x: number; y: number };
        p2: { x: number; y: number };
        distance: number;
        direction: string;
      }

      let resultingMap: Record<string, PathItem> = {};

      // Spread the anchor points of arrows attached to the same column so
      // their ends don't pile up on a single pixel.
      const ENDPOINT_SPACING = 10;
      const endpointTotals: Record<string, number> = {};
      const endpointIndex: Record<string, number> = {};
      const countedKeys = new Set<string>();
      Object.values(paths).forEach((group) =>
        group.forEach((item) => {
          const key = `${item.startElementLabel}-${item.endElementLabel}`;
          if (countedKeys.has(key)) return;
          countedKeys.add(key);
          [item.startElementLabel, item.endElementLabel].forEach((label) => {
            endpointTotals[label] = (endpointTotals[label] || 0) + 1;
          });
        }),
      );
      const nextEndpointOffset = (label: string) => {
        const i = endpointIndex[label] || 0;
        endpointIndex[label] = i + 1;
        return (i - (endpointTotals[label] - 1) / 2) * ENDPOINT_SPACING;
      };

      // Build the resulting map by grouping paths with same start-end elements
      Object.keys(paths).forEach((groupKey, groupIndex) => {
        const currentElement = paths[groupKey];
        for (const item of currentElement) {
          const pathKey = `${item.startElementLabel}-${item.endElementLabel}`;
          if (pathKey in resultingMap) {
            // Add to existing path group
            resultingMap[pathKey].properties.push({
              id: item.id,
              label: item.label,
              link: item.link,
            });
          } else {
            // Create new path group
            const results = calcPointsDistances(
              item.startElement,
              item.endElement,
              svgBB,
              nextEndpointOffset(item.startElementLabel),
              nextEndpointOffset(item.endElementLabel),
            );
            resultingMap[pathKey] = {
              id: pathKey,
              color: COLORS[groupIndex],
              group: pathKey,
              properties: [
                {
                  id: item.id,
                  label: item.label,
                  link: item.link,
                },
              ],
              ...results,
            };
          }
        }
      });

      // Convert resultingMap to array for processing
      const groupedPaths = Object.values(resultingMap);

      // Compute offset heights based on svg height and number of path groups to draw
      const offset = height / groupedPaths.length - minimumDistance;

      // Order paths in descending order by distance (farthest first, closest last)
      // This is critical: farthest arrows must be processed first to get the highest arc
      // and render first (behind), while closest arrows get the lowest arc and render last (on top)
      groupedPaths.sort((el1, el2) => el2.distance - el1.distance);

      setProcessedPaths(calcPaths(groupedPaths, offset));
    }
  }, [paths, svgRef, windowWidth, minimumDistance, calcPaths]);

  useEffect(() => {
    draw();
  }, [draw]);

  return {
    processedPaths,
    draw,
  };
};

export default useSvgCoordinator;
