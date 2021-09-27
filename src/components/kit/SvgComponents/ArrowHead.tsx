import { FC, useCallback } from 'react';

interface ArrowHeadProps {
  id: string;
  color: string;
  direction?: 'start' | 'end';
  orient?: string;
  size?: number;
}

const ArrowHead: FC<ArrowHeadProps> = ({
  color,
  size = 6,
  direction = 'end',
  orient = 'auto',
  ...props
}) => {
  const getD = useCallback(() => {
    return `M0,0 V${size * 2} L${size},${size} Z`;
  }, [size]);

  return (
    <>
      {direction === 'start' ? (
        <marker
          markerWidth="10"
          markerHeight="7"
          refX="5"
          refY="3.5"
          orient="auto"
          {...props}>
          <polygon points="10 0, 10 7, 0 3.5" fill={color} />
        </marker>
      ) : (
        <marker
          markerWidth="10"
          markerHeight="7"
          refX="5"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
          {...props}>
          <polygon points="0 0, 10 3.5, 0 7" fill={color} />
        </marker>
      )}
    </>
  );
};

export default ArrowHead;
