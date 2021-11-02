import styled from '@emotion/styled';
import { FC, HTMLAttributes } from 'react';

type EntityLabelProps = HTMLAttributes<HTMLDivElement> & {
  type: 'entity' | 'type' | 'property'
}

const labelsMap = {
  entity: 'entity',
  type: 'type',
  property: 'prop'
};

const Container = styled.div({
  display: 'flex',
  alignItems: 'center'
});

const Label = styled.p({
  fontSize: '12px',
  color: 'rgba(27, 31, 59, 0.65)',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
});

const Tag = styled.div({
  borderRadius: '6px',
  fontSize: '10px',
  backgroundColor: '#ffdac1',
  color: '#ff8738',
  marginRight: '5px',
  padding: '0 3px'
});

const EntityLabel: FC<EntityLabelProps> = ({ type, children, ...props }) => {
  return (
    <Container {...props}>
      <Tag>{labelsMap[type]}</Tag>
      <Label>{children}</Label>
    </Container>
  );
};

export default EntityLabel;
