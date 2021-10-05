import useWindowDimension from '@hooks/resize/useWindowResize';
import Path from '@services/classes';
import { bezierCurve, drawTo } from '@services/classes/PathOperators';
import { isEmptyObject } from '@services/utils/objects-utils';
import {
  useCallback, useEffect,
  useRef, useState
} from 'react';

export interface UseSvgCoordinatorProps {
  paths: Record<string, CoordinatorPath[]>;
  options?: Partial<DrawOptions>;
}

export interface CoordinatorPath {
  id: string;
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
  alfa: 40
};

const COLORS = [
  '#bd65a4',
  '#2fad96',
  '#7b439e',
  '#ff8a00',
  '#3682db',
  '#2fad96'
];

const getPoint = (element: HTMLElement, { top: svgTop = 0 }: Partial<DOMRect>) => {
  const { left, top, width } = element.getBoundingClientRect();
  const x = left + width / 2;
  // y is relative to where the svg origin is
  const y = top - svgTop;
  return [x, y];
};

const calcPointsDistances = (
  el1: HTMLElement,
  el2: HTMLElement,
  svgBoundingClientRect: DOMRect
) => {
  const [x1, y1] = getPoint(el1, svgBoundingClientRect);
  const [x2, y2] = getPoint(el2, svgBoundingClientRect);

  // draw always in the same direction [left - right] so that
  // labels aren't flipped
  if (x1 > x2) {
    // if path from right to left, set starting point as p2
    return {
      p1: { x: x2, y: y2 },
      p2: { x: x1, y: y1 },
      distance: x1 - x2,
      direction: 'start'
    };
  }
  return {
    p1: { x: x1, y: y1 },
    p2: { x: x2, y: y2 },
    distance: x2 - x1,
    direction: 'end'
  };
};

const useSvgCoordinator = ({
  paths,
  options
}: UseSvgCoordinatorProps) => {
  const {
    minimumDistance,
    alfa
  } = { ...DEFAULT_OPTIONS, ...options };

  const [processedPaths, setProcessedPaths] = useState<any>();
  const svgRef = useRef<SVGSVGElement>(null);
  const { windowWidth } = useWindowDimension();

  const calcPaths = useCallback((distancesObjects: any[], offset: number) => {
    let previousGroup = {
      group: '',
      horizontalOffset: 0
    };

    return distancesObjects.map(({
      p1, p2, ...rest
    }, index) => {
      const currentGroup = rest.group;
      const path = new Path(rest.direction === 'end'
        ? { x: p1.x, y: p1.y }
        : { x: p1.x - 5, y: p1.y - 5 });
      // offset between each path
      const offsetPath = offset * (index + 1);
      // horizontal offset for control points of
      // the same group, so that paths don't stack one on top of the other
      const horizontalOffset = previousGroup.group === currentGroup
        ? previousGroup.horizontalOffset - alfa
        : 0;

      previousGroup = {
        group: currentGroup,
        horizontalOffset
      };
      path.pipe(
        bezierCurve(
          // first control point
          p1.x + horizontalOffset, p1.y - (offsetPath - (0.9 * horizontalOffset)),
          // second control point
          p2.x, p2.y - (offsetPath - (0.9 * horizontalOffset))
        ),
        drawTo(rest.direction === 'end'
          ? p2.x + 5
          : p2.x,
        rest.direction === 'end'
          ? p2.y - 5
          : p2.y)
      );
      return {
        ...rest,
        path
      };
    });
  }, [alfa]);

  const draw = useCallback(() => {
    if (paths && !isEmptyObject(paths) && svgRef && svgRef.current) {
      // get svg bounding box to compute relative measures
      const svgBB = svgRef.current.getBoundingClientRect();
      // height of svg container
      const { height } = svgBB;
      // keep track of number of paths to draw
      // iterate on each group
      // each group contains a set of paths from the same source
      const distances = Object.keys(paths).reduce((acc, groupKey, index) => {
        // iterate on each path of a group
        return [
          ...acc,
          ...paths[groupKey].map(({
            id, startElement, endElement, ...rest
          }) => {
            const results = calcPointsDistances(startElement, endElement, svgBB);
            return {
              id,
              group: groupKey,
              color: COLORS[index],
              ...rest,
              ...results
            };
          })
        ];
      }, [] as any[]);

      // // compute offset heights based on svg height and number of paths to draw
      const offset = (height / distances.length) - minimumDistance;
      // order distances in ascending order
      distances.sort((el1, el2) => (el2.distance < el1.distance ? 1 : -1));
      setProcessedPaths(calcPaths(distances, offset));
    }
  }, [paths, svgRef, windowWidth]);

  useEffect(() => {
    draw();
  }, [draw]);

  return {
    svgRef,
    processedPaths,
    draw
  };
};

export default useSvgCoordinator;
