import Path, { bezierCurve, controlPoint, drawTo } from '@services/classes';
import { isEmptyObject } from '@services/utils/objects-utils';
import {
  FC, useEffect,
  useRef, HTMLAttributes,
  useState
} from 'react';
import { ArrowHead } from '../SvgComponents';

export interface SvgPathCoordinatorProps extends HTMLAttributes<SVGSVGElement> {
  paths: Record<string, CoordinatorPath[]>;
}

export interface CoordinatorPath {
  id: string;
  startElement: HTMLElement;
  endElement: HTMLElement;
  label?: string;
  link?: string;
}

const MINIMUM_DISTANCE = 15;

// const getHeights = (paths: Record<string, Path[]>) => {
//   Object.keys(paths).forEach((groupKey) => {
//     paths[groupKey].forEach((path) => {

//     });
//   })
// }

const getControlPoint = (x1: number, y1: number, x2: number, y2: number, height: number) => {
  const x = (x2 + x1) / 2;
  const y = y1 - height;
  return [x, y];
};

const getPoint = (element: HTMLElement, { top: svgTop = 0 }: Partial<DOMRect>) => {
  const { left, top, width } = element.getBoundingClientRect();
  const x = left + width / 2;
  // y is relative to where the svg origin is
  const y = top - svgTop;
  return [x, y];
};

const getBezierCurveControlPoints = () => {

};

// const calcPath = (
//   el1: HTMLElement,
//   el2: HTMLElement,
//   svgBoundingClientRect: DOMRect
// ) => {
//   const [x1, y1] = getPoint(el1, svgBoundingClientRect);
//   const [x2, y2] = getPoint(el2, svgBoundingClientRect);
//   // const [cx, cy] = getControlPoint(x1, y1, x2, y2);

//   // always draw from left to right so that text is positioned correctly
//   if (x1 > x2) {
//     const path = new Path({ x: x2, y: y2 - 5 });
//     // initially only draw the line without a curve because we don't know it yet
//     path.pipe(
//       drawTo(x1 - 10, y1)
//     );
//     return {
//       path,
//       p1: { x: x1, y: y1 },
//       p2: { x: x2, y: y2 },
//       distance: x1 - x2,
//       direction: 'start'
//     };
//   }
//   const path = new Path({ x: x1, y: y1 });
//   path.pipe(
//     drawTo(x2 - 10, y2 - 5)
//   );
//   return {
//     path,
//     p1: { x: x1, y: y1 },
//     p2: { x: x2, y: y2 },
//     distance: x2 - x1,
//     direction: 'end'
//   };
// };

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

const calcPaths = (distancesObjects: any[], { offset } : { offset: number }) => {
  let previousGroup = {
    group: '',
    alfa: 0
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
    const alfa = previousGroup.group === currentGroup ? previousGroup.alfa - 40 : 0;

    previousGroup = {
      group: currentGroup,
      alfa
    };
    path.pipe(
      bezierCurve(
        // first control point
        p1.x + alfa, p1.y - (offsetPath - (0.9 * alfa)),
        // second control point
        p2.x, p2.y - (offsetPath - (0.9 * alfa))
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
};

const SvgPathCoordinator: FC<SvgPathCoordinatorProps> = ({
  paths,
  ...props
}) => {
  const [processedPaths, setProcessedPaths] = useState<any>();
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (paths && !isEmptyObject(paths) && svgRef && svgRef.current) {
      // get svg bounding box to compute relative measures
      const svgBB = svgRef.current.getBoundingClientRect();
      // height of svg container
      const { height } = svgBB;
      // keep track of number of paths to draw
      // iterate on each group
      // each group contains a set of paths from the same source
      const distances = Object.keys(paths).reduce((acc, groupKey) => {
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
              ...rest,
              ...results
            };
          })
        ];
      }, [] as any[]);

      // // compute offset heights based on svg height and number of paths to draw
      const offset = (height / distances.length) - MINIMUM_DISTANCE;
      // order distances in ascending order
      distances.sort((el1, el2) => (el2.distance < el1.distance ? 1 : -1));
      setProcessedPaths(calcPaths(distances, { offset }));
    }
  }, [paths, svgRef]);

  return (
    <svg
      ref={svgRef}
      {...props}>
      <defs>
        <ArrowHead
          id="arrow-end"
          color="black"
          orient="auto"
          direction="end" />
        <ArrowHead
          id="arrow-start"
          color="black"
          orient="auto-start-reverse"
          direction="start" />
      </defs>
      {processedPaths && processedPaths.map((path: any) => (
        <>
          {path.label && (
            <text key={`label-${path.id}`} dy="-5%">
              <textPath href={`#${path.id}`} startOffset="50%" textAnchor="middle">
                {path.label}
              </textPath>
            </text>
          )}
          <path
            id={path.id}
            {...(
              path.direction === 'end' ? {
                markerEnd: `url(#arrow-${path.direction})`
              } : {
                markerStart: `url(#arrow-${path.direction})`
              }
            )}
            fill="none"
            stroke="black"
            key={path.id}
            d={path.path.draw()} />
        </>
      ))}
    </svg>
  );
};

export default SvgPathCoordinator;
