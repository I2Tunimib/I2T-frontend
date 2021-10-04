import { SidebarGroup, SidebarItem } from '@root/components/layout/Sidebar';
import { FC } from 'react';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import VerticalAlignBottomRoundedIcon from '@mui/icons-material/VerticalAlignBottomRounded';
import {
  Box, Button,
  IconButton, useMediaQuery
} from '@mui/material';

const SidebarContent: FC<any> = ({
  collapsed
}) => {
  const matches = useMediaQuery('(max-width:1230px)');

  return (
    <>
      <SidebarGroup padded>
        {collapsed ? (
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
            size="small"
            component="label"
            startIcon={<AddRoundedIcon />}
            color="primary"
            variant="text">
            New Dataset
            <input
              type="file"
              multiple
              hidden
            />
          </Button>
        )}
      </SidebarGroup>
      <SidebarGroup collapsed={collapsed}>
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
