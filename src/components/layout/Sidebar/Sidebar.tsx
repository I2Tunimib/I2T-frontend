import { IconButton, Typography, useMediaQuery } from '@material-ui/core';
import clsx from 'clsx';
import { FC, HTMLAttributes, ReactNode } from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';
import VerticalAlignBottomRoundedIcon from '@material-ui/icons/VerticalAlignBottomRounded';
import styles from './Sidebar.module.scss';

interface SidebarProps extends HTMLAttributes<HTMLDivElement> { }
interface SidebarGroupProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}
interface SidebarItemProps extends NavLinkProps {
  label: string;
  Icon: ReactNode;
}

export const SidebarGroup: FC<SidebarGroupProps> = ({
  children,
  padded = false,
  ...props
}) => {
  return (
    <div
      className={clsx(
        styles.Group,
        {
          [styles.Padded]: padded
        }
      )}
      {...props}>
      {children}
    </div>
  );
};

export const SidebarItem: FC<SidebarItemProps> = ({
  label,
  to,
  Icon,
  ...props
}) => {
  const matches = useMediaQuery('(max-width:1230px)');
  return (
    <NavLink
      to={to}
      activeClassName={styles.Active}
      className={styles.Item}>
      {matches ? Icon : label}
    </NavLink>
  );
};

const Sidebar: FC<SidebarProps> = ({
  children,
  ...props
}) => {
  return (
    <aside className={styles.Container} {...props}>
      {children}
    </aside>
  );
};

export default Sidebar;
