import useSvgCoordinator, { UseSvgCoordinatorProps } from '@hooks/svg/useSvgCoordinator';
import {
  FC, useEffect,
  HTMLAttributes
} from 'react';
import SvgArrow from '../SvgArrow';

export interface SvgPathCoordinatorProps
  extends UseSvgCoordinatorProps, HTMLAttributes<SVGSVGElement> {
  shouldRedraw?: () => boolean;
  onPathMouseEnter?: (id: string) => void;
  onPathMouseLeave?: () => void;
}

const SvgPathCoordinator: FC<SvgPathCoordinatorProps> = ({
  paths,
  shouldRedraw,
  onPathMouseEnter,
  onPathMouseLeave,
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
          key={`${path.id}_${index}`}
          id={`${path.id}_${index}`}
          d={path.path.draw()}
          arrowId={`${index}`}
          direction={path.direction}
          color={path.color}
          label={path.label}
          link={path.link}
          onMouseEnter={() => onPathMouseEnter && onPathMouseEnter(path)}
          onMouseLeave={onPathMouseLeave}
        />
      ))}
    </svg>
  );
};

export default SvgPathCoordinator;
