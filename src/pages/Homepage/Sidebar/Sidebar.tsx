import { Button, Typography } from '@material-ui/core';
import { FC } from 'react';
import StorageRoundedIcon from '@material-ui/icons/StorageRounded';
import PostAddRoundedIcon from '@material-ui/icons/PostAddRounded';
import AddRoundedIcon from '@material-ui/icons/AddRounded';
import { NavLink } from 'react-router-dom';
import { useAppDispatch } from '@hooks/store';
import { updateUI } from '@store/slices/tables/tables.slice';
import styles from './Sidebar.module.scss';

interface SidebarProps {}

const Sidebar: FC<SidebarProps> = () => {
  const dispatch = useAppDispatch();

  return (
    <div className={styles.Container}>
      <Button
        className={styles.UploadButton}
        startIcon={<AddRoundedIcon />}
        color="primary"
        variant="contained">
        Upload table
      </Button>
      <NavLink
        to="/raw"
        onClick={() => dispatch(updateUI({ selectedSource: 'raw' }))}
        activeClassName={styles.Active}
        className={styles.SidebarItem}>
        <StorageRoundedIcon />
        <Typography variant="body1">Raw tables</Typography>
      </NavLink>
      <NavLink
        to="/annotated"
        onClick={() => dispatch(updateUI({ selectedSource: 'annotated' }))}
        activeClassName={styles.Active}
        className={styles.SidebarItem}>
        <PostAddRoundedIcon />
        <Typography variant="body1">Annotated tables</Typography>
      </NavLink>
    </div>
  );
};

export default Sidebar;
