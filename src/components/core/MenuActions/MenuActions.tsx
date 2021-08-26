import {
  makeStyles, MenuItem,
  MenuList, PopperPlacementType
} from '@material-ui/core';
import { FC, ReactNode } from 'react';
import MenuBase from '../MenuBase';

interface MenuActionsProps {
  open: boolean;
  anchorElement: any;
  actions: Action[];
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
  actions,
  handleMenuItemClick,
  ...props
}) => {
  const menuClasses = useMenuStyles();

  return (
    <MenuBase {...props}>
      <MenuList className={menuClasses.list} autoFocus>
        {actions.map((action) => (
          <MenuItem
            key={action.id}
            className={menuClasses.root}
            onClick={() => handleMenuItemClick(action.id)}
          >
            {action.Icon && action.Icon}
            {action.label}
          </MenuItem>
        ))}

      </MenuList>
    </MenuBase>
  );
};

export default MenuActions;
