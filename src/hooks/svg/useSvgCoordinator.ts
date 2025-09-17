import useWindowDimension from "@hooks/resize/useWindowResize";
import Path from "@services/classes";
import { bezierCurve, drawTo } from "@services/classes/PathOperators";
import { isEmptyObject } from "@services/utils/objects-utils";
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
  "#2fad96",
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
    (distancesObjects: any[], offset: number) => {
      let previousGroup = {
        group: "",
        horizontalOffset: 0,
      };

      return distancesObjects.map(({ p1, p2, ...rest }, index) => {
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

        // Calculate more adaptive control point values
        // Limit the maximum Y offset to prevent arrows from getting too high
        const maxYOffset = 300;
        const yOffset1 = Math.min(
          offsetPath - 0.9 * horizontalOffset,
          maxYOffset
        );
        const yOffset2 = Math.min(
          offsetPath - 0.9 * horizontalOffset,
          maxYOffset
        );

        path.pipe(
          bezierCurve(
            // first control point
            p1.x + horizontalOffset,
            p1.y - yOffset1,
            // second control point
            p2.x,
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
      const distances = Object.keys(paths).reduce((acc, groupKey, index) => {
        // iterate on each path of a group
        return [
          ...acc,
          ...paths[groupKey].map(
            ({ id, startElement, endElement, ...rest }) => {
              const results = calcPointsDistances(
                startElement,
                endElement,
                svgBB,
                fullWidth,
                svgBB.width,
                scrollLeft
              );
              return {
                id,
                group: groupKey,
                color: COLORS[index],
                ...rest,
                ...results,
              };
            }
          ),
        ];
      }, [] as any[]);

      // // compute offset heights based on svg height and number of paths to draw
      const offset = height / distances.length - minimumDistance;
      // order distances in ascending order
      distances.sort((el1, el2) => (el2.distance < el1.distance ? 1 : -1));
      setProcessedPaths(calcPaths(distances, offset));
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
