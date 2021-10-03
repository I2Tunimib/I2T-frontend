import { MenuBase, SelectableMenuItem } from '@components/core';
import { MenuBaseProps } from '@components/core/MenuBase';
import { useQuery } from '@hooks/router';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { MenuList } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { selectCurrentView } from '@store/slices/table/table.selectors';
import { updateUI } from '@store/slices/table/table.slice';
import { FC } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styles from './ViewMenu.module.scss';

interface ViewMenuProps extends MenuBaseProps {}

const useMenuStyles = makeStyles({
  list: {
    outline: 0
  }
});

const ViewMenu: FC<ViewMenuProps> = ({
  handleClose,
  ...props
}) => {
  const classes = useMenuStyles();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const { view } = useQuery();

  const setView = (newView: 'table' | 'graph' | 'raw') => {
    history.push(`/table/${id}?view=${newView}`);
    handleClose();
  };

  return (
    <MenuBase handleClose={handleClose} {...props}>
      <MenuList autoFocus className={classes.list}>
        <SelectableMenuItem onClick={() => setView('table')} selected={view === 'table'}>Table view</SelectableMenuItem>
        <SelectableMenuItem onClick={() => setView('graph')} selected={view === 'graph'}>Graph view</SelectableMenuItem>
        <SelectableMenuItem onClick={() => setView('raw')} selected={view === 'raw'}>Raw view</SelectableMenuItem>
      </MenuList>
    </MenuBase>
  );
};

export default ViewMenu;
