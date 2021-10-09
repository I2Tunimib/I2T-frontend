import { FC, HTMLAttributes } from 'react';
import { ArrowHead } from '../SvgComponents';
import styles from './SvgArrow.module.scss';

interface SvgArrowProps {
  id: string;
  arrowId: string;
  d: string;
  direction: 'start' | 'end';
  color?: string;
  label?: string;
  link?: string;
  onMouseEnter?: (id: string) => void;
  onMouseLeave?: () => void;
}

const SvgArrow: FC<SvgArrowProps> = ({
  id,
  arrowId,
  d,
  direction,
  color = 'black',
  label,
  link,
  onMouseEnter,
  onMouseLeave
}) => {
  return (
    <>
      <defs>
        <ArrowHead
          id={arrowId}
          color={color}
          direction={direction} />
      </defs>
      <g
        className={styles.Arrow}
        onMouseEnter={() => onMouseEnter && onMouseEnter(id)}
        onMouseLeave={onMouseLeave}>
        <a href={link} target="_blank" rel="noreferrer">
          {label && (
            <text key={`label-${id}`} dy="-5%">
              <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
                {label}
              </textPath>
            </text>
          )}
          <path
            id={id}
            d={d}
            fill="none"
            stroke={color}
            {...(
              direction === 'end' ? {
                markerEnd: `url(#${arrowId})`
              } : {
                markerStart: `url(#${arrowId})`
              }
            )} />
        </a>
      </g>
    </>
  );
};

export default SvgArrow;
