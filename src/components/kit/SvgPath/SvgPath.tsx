import usePath from '@hooks/SvgPath/usePath';
import { ID } from '@store/interfaces/store';
import { useCallback, useEffect } from 'react';
import { ArrowHead } from '../SvgComponents';
import styles from './SvgPath.module.scss';

interface SvgPathProps {
  id: ID;
  shouldRedraw: () => boolean;
  startElement: HTMLElement;
  endElement: HTMLElement;
  svgElement: SVGSVGElement | null;
  label?: string;
  link?: string;
  color?: string;
}

const SvgPath = ({
  id,
  shouldRedraw,
  startElement,
  endElement,
  svgElement,
  label,
  link,
  color = 'black'
}: SvgPathProps) => {
  const { state, redraw } = usePath(
    startElement,
    endElement,
    { svgElement }
  );

  useEffect(() => {
    if (shouldRedraw()) {
      redraw();
    }
  }, [shouldRedraw]);

  const getId = useCallback(() => {
    return id.split(' ').join('');
  }, [id]);

  return (
    <>
      {state && (
        <a href={link} target="_blank" rel="noreferrer">
          <g className={styles.Path}>
            <defs>
              <ArrowHead
                id={`${getId()}-arrow`}
                color={color}
                orient="auto-start-reverse"
                direction={state.direction} />
            </defs>
            {label && (
              <text dy="-5%">
                <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
                  {label}
                </textPath>
              </text>
            )}
            <path
              id={id}
              {...(
                state.direction === 'end' ? {
                  markerEnd: `url(#${getId()}-arrow)`
                } : {
                  markerStart: `url(#${getId()}-arrow)`
                }
              )}
              fill="none"
              stroke={color}
              d={state.computedPath} />
          </g>
        </a>
      )}
    </>
  );
};

export default SvgPath;
