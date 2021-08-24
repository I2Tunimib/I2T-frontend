import { FC } from 'react';
import { Link } from 'react-router-dom';
import { ButtonProps } from '../Button';

/**
 * Button wrapper component.
 * It aims to decide which is the parent component of a Button,
 * it then propagates props to inner button or Link
 */
const ButtonBase: FC<ButtonProps> = (props) => {
  // eslint-disable-next-line react/destructuring-assignment
  const Component = props.to ? Link : 'button';

  return (
    <Component {...props} />
  );
};

export default ButtonBase;
