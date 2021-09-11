import { Button, Typography } from '@material-ui/core';
import { ChangeEvent, FC } from 'react';
import StorageRoundedIcon from '@material-ui/icons/StorageRounded';
import PostAddRoundedIcon from '@material-ui/icons/PostAddRounded';
import AddRoundedIcon from '@material-ui/icons/AddRounded';
import { NavLink } from 'react-router-dom';
import { useAppDispatch } from '@hooks/store';
import { updateUI } from '@store/slices/tables/tables.slice';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  onFileChange: (files: File[]) => void;
}

const PERMITTED_FILE_EXTENSIONS = ['csv', 'json'];

const Sidebar: FC<SidebarProps> = ({
  onFileChange
}) => {
  const dispatch = useAppDispatch();

  const handleInputFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files) {
      const permittedFiles: File[] = [];
      Object.keys(files).forEach((key) => {
        const [fileExtension, ...rest] = files[key as any].name.split('.').reverse();
        if (PERMITTED_FILE_EXTENSIONS.find((extension) => extension === fileExtension)) {
          permittedFiles.push(files[key as any]);
        }
      });
      if (permittedFiles.length > 0) {
        onFileChange(permittedFiles);
      }
    }
  };

  return (
    <div className={styles.Container}>
      <Button
        component="label"
        className={styles.UploadButton}
        startIcon={<AddRoundedIcon />}
        color="primary"
        variant="contained">
        Upload table
        <input
          onChange={handleInputFileChange}
          type="file"
          multiple
          hidden
        />
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
