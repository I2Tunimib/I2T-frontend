import { FC, HTMLAttributes } from 'react';
import styled from '@emotion/styled';

interface BatteryProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  size?: 'small' | 'medium';
}

const Container = styled.div<{ size: 'small' | 'medium' }>`
  position: relative;
  width: ${({ size }) => (size === 'medium' ? '90px' : '70px')};
  height: ${({ size }) => (size === 'medium' ? '35px' : '25px')};
  border-radius: 6px;
  background-color: rgb(234, 238, 243);
  overflow: hidden;
`;

const Filling = styled.div<BatteryProps>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: ${(props) => (props.value < 40
    ? '#d3dce9'
    : props.value < 70
      ? 'rgb(255, 217, 128)'
      : 'rgb(106, 231, 156)')};
  width: ${(props) => props.value}%;
`;

const Label = styled.div<{ size: 'small' | 'medium' }>`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: rgb(32, 38, 45);
  font-weight: 700;
  font-size: ${({ size }) => (size === 'medium' ? '14px' : '12px')};
  z-index: 1;
`;

const Battery: FC<BatteryProps> = ({
  value,
  size = 'small',
  ...props
}) => {
  return (
    <Container size={size} {...props}>
      <Label size={size}>{`${value.toFixed(2)}%`}</Label>
      <Filling value={value} />
    </Container>
  );
};

export default Battery;
