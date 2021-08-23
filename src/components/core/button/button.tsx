import { SvgIconComponent } from '@material-ui/icons';
import { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';
import ButtonBase from '../ButtonBase/ButtonBase';
import styles from './Button.module.scss';

export interface IButtonProps extends HTMLAttributes<HTMLDivElement> {
  type?: 'button' | 'submit'; // type of button
  variant?: 'primary'; // theme variant
  iconAlign?: 'left' | 'right'; // icon alignment
  to?: string; // route path, button works as link
  Icon?: SvgIconComponent; // icon
  onClick?: () => void; // click handler
}

/**
 * Button component.
 * App button which works both as a react-router-dom Link or button.
 */
const Button: FC<IButtonProps> = ({
  to = undefined,
  type = 'button',
  iconAlign = 'left',
  variant = 'primary',
  Icon = undefined,
  onClick = undefined,
  className,
  children
}: IButtonProps) => (
  <ButtonBase
    to={to}
    onClick={onClick}
    type={type}
    className={
      clsx(
        className,
        styles.AppButton,
        {
          [styles.Primary]: variant === 'primary',
          [styles.IconLeft]: iconAlign === 'left',
          [styles.IconRight]: iconAlign === 'right',
          [styles.Link]: to
        }
      )
    }
  >
    {children}
    {Icon && <Icon className={iconAlign === 'left' ? styles.IconLeft : styles.IconRight} />}
  </ButtonBase>
);

export default Button;
