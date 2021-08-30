import {
  MenuItem, MenuItemProps,
  SvgIconProps,
  SvgIconTypeMap, Typography
} from '@material-ui/core';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { FC, ReactElement } from 'react';
import DividerMenu from '../MenuDivider';
import styles from './MenuItemIconLabel.module.scss';

interface MenuItemIconLabelProps extends MenuItemProps {
  Icon?: any
  button?: true;
  divider?: boolean;
  shortcutLabel?: string;
}

const MenuItemIconLabel: FC<MenuItemIconLabelProps> = ({
  Icon,
  shortcutLabel,
  divider,
  children,
  ...props
}) => {
  return (
    <div className={styles.MenuItemOuterWrapper}>
      <MenuItem className={styles.MenuItemRoot} {...props}>
        {Icon && <Icon className={styles.Icon} />}
        <div className={styles.MenuItemInnerWrapper}>
          <Typography variant="body2" className={styles.Text}>
            {children}
          </Typography>
          {shortcutLabel && (
            <Typography
              variant="subtitle2"
              className={styles.ShortcutLabel}
              color="textSecondary">
              {shortcutLabel}
            </Typography>
          )}
        </div>
      </MenuItem>
      {divider && <DividerMenu />}
    </div>
  );
};

export default MenuItemIconLabel;
