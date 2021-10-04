import { Box, IconButton, useMediaQuery } from '@mui/material';
import clsx from 'clsx';
import {
  Children, cloneElement,
  FC, HTMLAttributes,
  isValidElement, ReactNode
} from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';
import VerticalAlignBottomRoundedIcon from '@mui/icons-material/VerticalAlignBottomRounded';
import styles from './Sidebar.module.scss';

interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
  onCollapsedChange?: () => void;
  collapsed?: boolean;
}
interface SidebarGroupProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  collapsed?: boolean;
}
interface SidebarItemProps extends NavLinkProps {
  label: string;
  Icon: ReactNode;
  collapsed?: boolean;
}

export const SidebarGroup: FC<SidebarGroupProps> = ({
  children,
  padded = false,
  collapsed,
  ...props
}) => {
  console.log(collapsed);
  return (
    <div
      className={clsx(
        styles.Group,
        {
          [styles.Padded]: padded
        }
      )}
      {...props}>
      {Children.map(children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child, { collapsed });
        }
        return child;
      })}
    </div>
  );
};

export const SidebarItem: FC<SidebarItemProps> = ({
  label,
  to,
  Icon,
  collapsed,
  ...props
}) => {
  return (
    <NavLink
      to={to}
      activeClassName={styles.Active}
      className={styles.Item}>
      {collapsed ? Icon : label}
    </NavLink>
  );
};

const Sidebar: FC<SidebarProps> = ({
  children,
  onCollapsedChange,
  collapsed = false,
  ...props
}) => {
  return (
    <aside
      className={clsx(
        styles.Container,
        {
          [styles.Collapsed]: collapsed
        }
      )}
      {...props}>
      {Children.map(children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child, { collapsed });
        }
        return child;
      })}
      <Box sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: 'auto'
      }}>
        <IconButton
          onClick={() => onCollapsedChange && onCollapsedChange()}
          sx={{
            transform: collapsed ? 'rotate(270deg)' : 'rotate(90deg)'
          }}>
          <VerticalAlignBottomRoundedIcon />
        </IconButton>
      </Box>
    </aside>
  );
};

export default Sidebar;
