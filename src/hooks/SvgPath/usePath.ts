import useWindowDimension from '@hooks/resize/useWindowResize';
import Path from '@services/classes';
import { controlPoint, drawTo } from '@services/classes/PathOperators';
import {
  MutableRefObject, useCallback,
  useEffect, useState
} from 'react';

interface UsePathOptions {
  svgElement: SVGSVGElement | null;
}

const getRelativeY = (yElement: number, svgTop: number) => {
  return yElement - svgTop;
};

const getControlPoint = (x1: number, y1: number, x2: number, y2: number) => {
  const x = (x2 + x1) / 2;
  const y = y1 - 200;
  return [x, y];
};

const getPoint = (element: HTMLElement, { top: svgTop = 0 }: Partial<DOMRect>) => {
  const { left, top, width } = element.getBoundingClientRect();
  const x = left + width / 2;
  const y = getRelativeY(top, svgTop);
  return [x, y];
};

interface CalcPathOptions {
  svgBoundingClientRect: DOMRect;
}

const calcPath = (
  el1: HTMLElement,
  el2: HTMLElement,
  svgBoundingClientRect: DOMRect
): UsePathState => {
  const [x1, y1] = getPoint(el1, svgBoundingClientRect);
  const [x2, y2] = getPoint(el2, svgBoundingClientRect);
  const [cx, cy] = getControlPoint(x1, y1, x2, y2);

  if (x1 > x2) {
    const path = new Path({ x: x2, y: y2 - 5 });
    path.pipe(
      controlPoint(cx, cy),
      drawTo(x1 - 10, y1)
    );
    return { computedPath: path.d, direction: 'start' };
  }

  const path = new Path({ x: x1, y: y1 });
  path.pipe(
    controlPoint(cx, cy),
    drawTo(x2 - 10, y2 - 5)
  );
  return { computedPath: path.d, direction: 'end' };
};

const DEFAULT_BB: DOMRect = {
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
  toJSON: () => { }
};

interface UsePathState {
  computedPath: string;
  direction: 'start' | 'end';
}

const usePath = (
  startElement: HTMLElement,
  endElement: HTMLElement,
  options: UsePathOptions
) => {
  const { svgElement } = options;
  const [state, setState] = useState<UsePathState>();
  const { windowWidth } = useWindowDimension();

  const redraw = useCallback(() => {
    const svgBoundingClientRect = svgElement?.getBoundingClientRect() || DEFAULT_BB;
    const newState = calcPath(startElement, endElement, svgBoundingClientRect);
    setState(newState);
  }, [startElement, endElement, svgElement, windowWidth]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  return {
    state,
    redraw
  };
};

export default usePath;
