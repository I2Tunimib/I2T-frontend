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
  label?: string;
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
  scrollLeft: number = 0
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
  scrollLeft: number = 0
) => {
  const [x1, y1] = getPoint(
    el1,
    svgBoundingClientRect,
    fullWidth,
    visibleWidth,
    scrollLeft
  );
  const [x2, y2] = getPoint(
    el2,
    svgBoundingClientRect,
    fullWidth,
    visibleWidth,
    scrollLeft
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

      // Flatten the grouped paths to individual paths for drawing
      const individualPaths: any[] = [];

      groupedPaths.forEach(({ p1, p2, properties, ...rest }, groupIndex) => {
        const currentGroup = rest.group;

        properties.forEach((property: any, propIndex: number) => {
          individualPaths.push({
            ...rest,
            p1,
            p2,
            ...property, // id, label, link
            groupIndex,
            propertyIndex: propIndex,
          });
        });
      });

      return individualPaths.map(({ p1, p2, ...rest }, index) => {
        const currentGroup = rest.group;
        const path = new Path(
          rest.direction === "end"
            ? { x: p1.x, y: p1.y }
            : { x: p1.x - 5, y: p1.y - 5 }
        );
        // offset between each path
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
        const horizontalJitter = Math.sin(jitterSeed * 1.5) * 15; // ±15px horizontal jitter
        const verticalJitter = Math.cos(jitterSeed * 2.3) * 25; // ±25px vertical jitter

        // Calculate more adaptive control point values
        // Limit the maximum Y offset to prevent arrows from getting too high
        const maxYOffset = 300;
        const yOffset1 = Math.min(
          offsetPath - 0.9 * horizontalOffset + verticalJitter,
          maxYOffset
        );
        const yOffset2 = Math.min(
          offsetPath - 0.9 * horizontalOffset + verticalJitter * 0.8,
          maxYOffset
        );

        path.pipe(
          bezierCurve(
            // first control point with horizontal jitter
            p1.x + horizontalOffset + horizontalJitter,
            p1.y - yOffset1,
            // second control point with different jitter
            p2.x + horizontalJitter * 0.6,
            p2.y - yOffset2
          ),
          drawTo(
            rest.direction === "end" ? p2.x + 5 : p2.x,
            rest.direction === "end" ? p2.y - 5 : p2.y
          )
        );
        return {
          ...rest,
          path,
        };
      });
    },
    [alfa]
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
              scrollLeft
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

      // Order paths in ascending order by distance
      groupedPaths.sort((el1, el2) => (el2.distance < el1.distance ? 1 : -1));

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
