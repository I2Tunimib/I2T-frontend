import { SidebarGroup, SidebarItem } from '@root/components/layout/Sidebar';
import { FC } from 'react';
import StorageRoundedIcon from '@material-ui/icons/StorageRounded';
import AddRoundedIcon from '@material-ui/icons/AddRounded';
import { Button, IconButton, useMediaQuery } from '@material-ui/core';

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
