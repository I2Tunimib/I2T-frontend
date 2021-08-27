import {
  makeStyles, MenuItem,
  MenuList, PopperPlacementType
} from '@material-ui/core';
import { FC, ReactNode } from 'react';
import MenuBase from '../MenuBase';
import styles from './MenuActions.module.scss';

interface MenuActionsProps {
  open: boolean;
  anchorElement: any;
  actionGroups: Action[][];
  id?: string;
  placement?: PopperPlacementType | undefined;
  handleClose: () => void;
  handleMenuItemClick: (id: string) => void;
}

export interface Action {
  id: string;
  label: string;
  Icon?: ReactNode
}

const useMenuStyles = makeStyles({
  list: {
    outline: 0,
    paddingTop: '4px',
    paddingBottom: '4px'
  },
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 10px',
    fontSize: '14px'
  }
});

const MenuActions: FC<MenuActionsProps> = ({
  actionGroups,
  handleMenuItemClick,
  ...props
}) => {
  const menuClasses = useMenuStyles();

  return (
    <MenuBase {...props}>
      <MenuList className={menuClasses.list} autoFocus>
        {actionGroups.map((group, index) => (
          <div key={index} className={styles.MenuActionGroup}>
            {group.map((action) => (
              <MenuItem
                key={action.id}
                className={menuClasses.root}
                onClick={() => handleMenuItemClick(action.id)}
              >
                {action.Icon && action.Icon}
                {action.label}
              </MenuItem>
            ))}
          </div>
        ))}
      </MenuList>
    </MenuBase>
  );
};

export default MenuActions;
