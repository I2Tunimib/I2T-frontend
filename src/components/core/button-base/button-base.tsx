import { Link } from 'react-router-dom';
import { IButtonProps } from '../button/button';

/**
 * Button wrapper component.
 * It aims to decide which is the parent component of a Button,
 * it then propagates props to inner button or Link
 */
const ButtonBase = (props: IButtonProps) => {
  // eslint-disable-next-line react/destructuring-assignment
  const Component = props.to ? Link : 'button';

  return (
    <Component {...props} />
  );
};

export default ButtonBase;
