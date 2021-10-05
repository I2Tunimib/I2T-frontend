import useSvgCoordinator, { UseSvgCoordinatorProps } from '@hooks/svg/useSvgCoordinator';
import {
  FC, useEffect,
  HTMLAttributes
} from 'react';
import SvgArrow from '../SvgArrow';

export interface SvgPathCoordinatorProps
  extends UseSvgCoordinatorProps, HTMLAttributes<SVGSVGElement> {
  shouldRedraw?: () => boolean;
}

const SvgPathCoordinator: FC<SvgPathCoordinatorProps> = ({
  paths,
  shouldRedraw,
  ...props
}) => {
  const {
    svgRef,
    processedPaths,
    draw
  } = useSvgCoordinator({
    paths,
    options: {
      alfa: 30
    }
  });

  useEffect(() => {
    if (shouldRedraw && shouldRedraw()) {
      // redraw when condition is met
      draw();
    }
  }, [shouldRedraw]);

  return (
    <svg
      ref={svgRef}
      {...props}>
      {processedPaths && processedPaths.map((path: any, index: number) => (
        <SvgArrow
          key={path.id}
          id={path.id}
          d={path.path.draw()}
          arrowId={`${index}`}
          direction={path.direction}
          color={path.color}
          label={path.label}
          link={path.link}
        />
      ))}
    </svg>
  );
};

export default SvgPathCoordinator;
