import { FC } from 'react';
import styled from '@emotion/styled';

interface TutorialProps {
  positions: Record<string, BBox>;
  activePosition: string;
}

interface BBox {
  height: number;
  width: number;
  x: number;
  y: number;
  bottom: number;
  left: number;
  right: number;
  top: number;
}

interface SpotlightProps {
  bbox: BBox;
}

const Spotlight = styled.div<SpotlightProps>(({ bbox }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: `${bbox.width}px`,
  height: `${bbox.height}px`,
  transition: 'all .3s cubic-bezier(.6,.4,0,1),opacity .15s ease',
  transform: `translate3d(${bbox.left}px, ${bbox.top}px, 0)`,
  boxShadow: 'inset #fff 0 0 0 2px, #000 0 0 0 4000px',
  opacity: '.6',
  borderRadius: '10px',
  zIndex: 10001
}));

const Tutorial: FC<TutorialProps> = ({
  positions,
  activePosition
}) => {
  return positions[activePosition] ? <Spotlight bbox={positions[activePosition]} /> : null;
};

export default Tutorial;
