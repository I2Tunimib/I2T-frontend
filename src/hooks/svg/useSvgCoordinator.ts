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

const getPoint = (
  element: HTMLElement,
  { top: svgTop = 0 }: Partial<DOMRect>,
  fullWidth: number,
  visibleWidth: number,
  scrollLeft: number = 0,
) => {
  // Get element position relative to viewport
  const { left, top, width } = element.getBoundingClientRect();

  // Add scroll position to get correct coordinate
  const correctedLeft = left + scrollLeft;
  const x = correctedLeft + width / 2;
  const y = top - svgTop;
  //log all parameters

  console.log("getPoint", {
    svgTop,
    left,
    top,
    width,
    fullWidth,
    visibleWidth,
    scrollLeft,
    correctedLeft,
    x,
    y,
  });
  return [x, y];
};

const calcPointsDistances = (
  el1: HTMLElement,
  el2: HTMLElement,
  svgBoundingClientRect: DOMRect,
  fullWidth: number,
  visibleWidth: number,
  scrollLeft: number = 0,
) => {
  const [x1, y1] = getPoint(
    el1,
    svgBoundingClientRect,
    fullWidth,
    visibleWidth,
    scrollLeft,
  );
  const [x2, y2] = getPoint(
    el2,
    svgBoundingClientRect,
    fullWidth,
    visibleWidth,
    scrollLeft,
  );

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

      // Each arrow gets a guaranteed height based on its position in the sorted array
      // Farthest arrows (index 0) get the highest arc, closest arrows (last index) get the lowest
      // This ensures proper vertical stacking where longer arrows always go over shorter ones
      const totalArrows = groupedPaths.length;

      // Detect bidirectional arrows (A→B and B→A) for special handling
      const bidirectionalPairs = new Map<string, number>();
      const processedGroups = new Set<string>();

      groupedPaths.forEach((path, idx) => {
        const [start, end] = path.group.split("-");
        const reverseGroup = `${end}-${start}`;

        // Check if the reverse path exists
        const reverseIndex = groupedPaths.findIndex(
          (p) => p.group === reverseGroup,
        );

        if (reverseIndex !== -1 && !processedGroups.has(path.group)) {
          // Mark both directions as bidirectional
          bidirectionalPairs.set(path.group, 0);
          bidirectionalPairs.set(reverseGroup, 1);
          processedGroups.add(path.group);
          processedGroups.add(reverseGroup);
        }
      });

      // Also group by distance for other cases
      const distanceGroups = new Map<number, number>();
      groupedPaths.forEach((path) => {
        const roundedDistance = Math.round(path.distance / 10) * 10; // Round to nearest 10px
        distanceGroups.set(
          roundedDistance,
          (distanceGroups.get(roundedDistance) || 0) + 1,
        );
      });

      const distanceCounters = new Map<number, number>();

      return groupedPaths.map(({ p1, p2, properties, ...rest }, index) => {
        const currentGroup = rest.group;
        const path = new Path(
          rest.direction === "end"
            ? { x: p1.x, y: p1.y }
            : { x: p1.x - 5, y: p1.y - 5 },
        );

        // Calculate height based on index position to ensure proper vertical layering
        // Index 0 (farthest) = maximum height, last index (closest) = minimum height
        // Use a progressive scale with enough separation to prevent intersections
        const minHeight = 40;
        const maxHeight = 200;
        const heightStep =
          (maxHeight - minHeight) / Math.max(1, totalArrows - 1);

        // Reverse the index so farthest (index 0) gets maxHeight
        let baseHeight = maxHeight - index * heightStep;

        // Check if this is a bidirectional arrow
        if (bidirectionalPairs.has(rest.group)) {
          const bidirOffset = bidirectionalPairs.get(rest.group)!;
          // Give bidirectional pairs very clear separation: 50px difference
          baseHeight = baseHeight + bidirOffset * 50;
        } else {
          // Add additional offset for arrows with the same distance (non-bidirectional)
          const roundedDistance = Math.round(rest.distance / 10) * 10;
          const sameDistanceCount = distanceGroups.get(roundedDistance) || 1;

          if (sameDistanceCount > 1) {
            const currentCount = distanceCounters.get(roundedDistance) || 0;
            distanceCounters.set(roundedDistance, currentCount + 1);

            // Add progressive offset for each arrow with the same distance
            const sameDistanceOffset = currentCount * 35; // 35px offset per duplicate
            baseHeight = baseHeight + sameDistanceOffset;
          }
        }

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

        // Add jitter to prevent overlapping arrows
        // Use a deterministic jitter based on path properties for consistency
        const jitterSeed = rest.id.length + index;
        const horizontalJitter = Math.sin(jitterSeed * 2) * 15; // ±15px horizontal jitter
        const verticalJitter = Math.cos(jitterSeed * 2.3) * 10; // Reduced vertical jitter

        // Calculate control point Y offsets - each arrow uses its own baseHeight as the maximum
        // NO global maxHeight clamp - each arrow has its own individual maximum height
        const yOffset1 =
          baseHeight +
          offsetPath * 0.2 -
          0.9 * horizontalOffset +
          verticalJitter;
        const yOffset2 =
          baseHeight +
          offsetPath * 0.2 -
          0.9 * horizontalOffset +
          verticalJitter * 0.8;

        path.pipe(
          bezierCurve(
            // first control point with horizontal jitter
            p1.x + horizontalOffset + horizontalJitter,
            p1.y - yOffset1,
            // second control point with different jitter
            p2.x + horizontalJitter * 0.6,
            p2.y - yOffset2,
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
      console.log("*** current paths ***", paths);
      // get svg bounding box to compute relative measures
      const svgBB = svgRef.current.getBoundingClientRect();
      const container = svgRef.current.parentElement;

      const fullWidth = container?.scrollWidth || svgRef.current.scrollWidth;
      const scrollLeft = container?.scrollLeft || 0;
      // height of svg container
      const { height } = svgBB;
      console.log("Container info:", {
        visibleWidth: svgBB.width,
        fullWidth,
        scrollLeft,
      });
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

      // Build the resulting map by grouping paths with same start-end elements
      Object.keys(paths).forEach((groupKey, groupIndex) => {
        const currentElement = paths[groupKey];
        for (const item of currentElement) {
          const pathKey = `${item.startElementLabel}-${item.endElementLabel}`;
          console.log("*** Current Key ***", pathKey);

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
              fullWidth,
              svgBB.width,
              scrollLeft,
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
