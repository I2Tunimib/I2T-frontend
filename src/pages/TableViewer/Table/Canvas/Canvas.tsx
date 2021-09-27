import useCanvas, { Context } from '@hooks/canvas/useCanvas';
import { isEmptyObject } from '@services/utils/objects-utils';
import {
  FC, HTMLAttributes,
  MutableRefObject,
  Ref, useEffect
} from 'react';

interface CanvasProps extends HTMLAttributes<HTMLCanvasElement> {
  columnRefs: MutableRefObject<Record<string, HTMLElement>>;
  headerExpanded: boolean;
}

const Canvas: FC<CanvasProps> = ({
  columnRefs,
  headerExpanded,
  ...props
}: CanvasProps) => {
  const {
    canvasRef,
    draw,
    state: { boundingClientRect }
  } = useCanvas();
  // const draw = (ctx: Context, frameCount: number) => {
  //   ctx.quadraticCurveTo(cpx, cpy, x, y);
  //   // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  //   // ctx.fillStyle = '#000000';
  //   // ctx.beginPath();
  //   // ctx.arc(50, 100, 20 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI);
  //   // ctx.fill();
  // };

  const getRelativeY = (yElement: number) => {
    return yElement - boundingClientRect.top;
  };

  function findAngle(x1: number, y1: number, x2: number, y2: number) {
    // make sx and sy at the zero point
    return Math.atan2((y2 - y1), (x2 - x1));
  }

  const getElementHorizontalCenterPoint = (element: HTMLElement) => {
    const { left, top, width } = element.getBoundingClientRect();
    const x = left + width / 2;
    const y = getRelativeY(top);
    return [x, y];
  };

  const getControlPoint = (element1: HTMLElement, element2: HTMLElement) => {
    const [x1, y1] = getElementHorizontalCenterPoint(element1);
    const [x2, y2] = getElementHorizontalCenterPoint(element2);

    const x = x2 - x1;
    const y = getRelativeY(y1) - 100;
    return [x, y];
  };

  const drawLabel = (
    ctx: Context,
    text: string,
    p1: {x: number; y: number},
    p2: {x: number; y: number},
    // eslint-disable-next-line no-undef
    alignment: CanvasTextAlign = 'center',
    padding = 0
  ) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const p = p1;
    const pad = 1 / 2;
    ctx.save();
    ctx.textAlign = alignment;
    ctx.translate(p.x + dx * pad, p.y + dy * pad);
    ctx.rotate(Math.atan2(dy, dx));
    ctx.fillText(text, 0, 0);
    ctx.restore();
  };

  const drawArrowhead = (
    ctx: Context,
    x: number, y: number,
    angle: number,
    sizeX = 12, sizeY = 12
  ) => {
    const hx = sizeX / 2;
    const hy = sizeY / 2;
    ctx.translate((x), (y));
    ctx.rotate(angle);
    ctx.translate(-hx, -hy);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 1 * sizeY);
    ctx.lineTo(1 * sizeX, 1 * hy);
    ctx.closePath();
    ctx.fill();
  };

  const drawArrow = (element1: HTMLElement, element2: HTMLElement) => {
    const [x1, y1] = getElementHorizontalCenterPoint(element1);
    const [x2, y2] = getElementHorizontalCenterPoint(element2);
    const [cx, cy] = getControlPoint(element1, element2);

    draw((ctx, frameCount) => {
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cx, cy, x2, y2);
      ctx.stroke();
      // ctx.fillText('property', x1, y2 - 50);
      const angle = findAngle(cx, cy, x2, y2);
      drawArrowhead(ctx, x2, y2, angle, 12, 12);
    });
  };

  useEffect(() => {
    if (columnRefs && !isEmptyObject(columnRefs.current)) {
      if (headerExpanded) {
        const { col0, col1 } = columnRefs.current;
        setTimeout(() => {
          drawArrow(col0, col1);
        }, 300);
      }
      // const ref = columnRefs.current[0];
      // console.log(ref.offsetTop);
    }
  }, [columnRefs, headerExpanded]);

  return <canvas ref={canvasRef} {...props} />;
};

export default Canvas;
