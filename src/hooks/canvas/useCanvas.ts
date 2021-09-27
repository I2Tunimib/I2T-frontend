import {
  useRef, useEffect,
  useCallback, useState
} from 'react';

interface UseCanvasOptions {
  context: '2d' | '3d';
}
interface CanvasState {
  boundingClientRect: DOMRect;
}

export type DrawCallback = (ctx: Context, frameCount: number) => void;
export type Context = CanvasRenderingContext2D;

const DEFAULT_OPTIONS: UseCanvasOptions = {
  context: '2d'
};

const updateCanvasSize = (canvas: HTMLCanvasElement, context: Context) => {
  const { width, height } = canvas.getBoundingClientRect();

  if (canvas.width !== width || canvas.height !== height) {
    const { devicePixelRatio: ratio = 1 } = window;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.scale(ratio, ratio);
    return true;
  }

  return false;
};

const DEFAULT_STATE: CanvasState = {
  boundingClientRect: {
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON: () => {}
  }
};

const useCanvas = (options = DEFAULT_OPTIONS) => {
  const [state, setState] = useState<CanvasState>(DEFAULT_STATE);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback((callback: DrawCallback) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext(options.context || '2d') as Context;

      if (context) {
        const frameCount = 0;
        // let animationFrameId = 0;

        // const render = () => {
        //   frameCount++;
        updateCanvasSize(canvas, context);
        callback(context, frameCount);
        //   animationFrameId = window.requestAnimationFrame(render);
        // };
        // render();
      }
    }
  }, []);

  useEffect(() => {
    if (canvasRef && canvasRef.current) {
      const boundingClientRect = canvasRef.current.getBoundingClientRect();
      setState((old) => ({ ...old, boundingClientRect }));
    }
  }, [canvasRef]);

  useEffect(() => {
    return () => {
      // window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   if (canvas) {
  //     const context = canvas.getContext(options.context || '2d') as Context;

  //     if (context) {
  //       let frameCount = 0;
  //       let animationFrameId = 0;

  //       const render = () => {
  //         frameCount++;
  //         updateCanvasSize(canvas, context);
  //         draw(context, frameCount);
  //         animationFrameId = window.requestAnimationFrame(render);
  //       };
  //       render();

  //       return () => {
  //         window.cancelAnimationFrame(animationFrameId);
  //       };
  //     }
  //   }
  // }, [draw]);

  return {
    canvasRef,
    draw,
    state
  };
};

export default useCanvas;
