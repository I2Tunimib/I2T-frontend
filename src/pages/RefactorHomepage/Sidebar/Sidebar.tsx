import { Button, Typography } from '@material-ui/core';
import { FC } from 'react';
import StorageRoundedIcon from '@material-ui/icons/StorageRounded';
import PostAddRoundedIcon from '@material-ui/icons/PostAddRounded';
import AddRoundedIcon from '@material-ui/icons/AddRounded';
import styled from 'styled-components';

interface SidebarProps { }

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
  padding-top: 20px;
`;

const SidebarItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  outline: none;
  border: none;
  background: none;
  padding: 10px 24px;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  & > svg{
    color: #707070;
  }
  &:hover {
    background-color: #ededed;
  }
`;

const UploadButton = styled(Button)`
  align-self: center;
  margin-bottom: 20px !important;
`;

const Sidebar: FC<SidebarProps> = () => {
  return (
    <Wrapper>
      <UploadButton
        startIcon={<AddRoundedIcon />}
        color="primary"
        variant="contained">
        Upload table
      </UploadButton>
      <SidebarItem>
        <StorageRoundedIcon />
        <Typography variant="body1">Raw tables</Typography>
      </SidebarItem>
      <SidebarItem>
        <PostAddRoundedIcon />
        <Typography variant="body1">Annotated tables</Typography>
      </SidebarItem>
    </Wrapper>
  );
};

export default Sidebar;
