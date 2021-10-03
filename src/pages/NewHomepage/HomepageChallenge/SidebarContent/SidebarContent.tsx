import { SidebarGroup, SidebarItem } from '@root/components/layout/Sidebar';
import { FC } from 'react';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Button, IconButton, useMediaQuery } from '@mui/material';

const SidebarContent: FC<any> = () => {
  const matches = useMediaQuery('(max-width:1230px)');

  return (
    <>
      <SidebarGroup padded>
        {matches ? (
          <IconButton
            size="medium"
            component="label">
            <AddRoundedIcon />
            <input
              type="file"
              multiple
              hidden
            />
          </IconButton>
        ) : (
          <Button
            component="label"
            startIcon={<AddRoundedIcon />}
            color="primary"
            variant="contained">
            New Dataset
            <input
              type="file"
              multiple
              hidden
            />
          </Button>
        )}
      </SidebarGroup>
      <SidebarGroup>
        <SidebarItem
          label="Datasets"
          Icon={<StorageRoundedIcon />}
          to="/"
        />
      </SidebarGroup>
    </>
  );
};

export default SidebarContent;
