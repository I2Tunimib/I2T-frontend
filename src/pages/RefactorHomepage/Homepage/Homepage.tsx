import { Fab } from '@material-ui/core';
import { FC } from 'react';
import AddRoundedIcon from '@material-ui/icons/AddRounded';
import styled from 'styled-components';
import Sidebar from '../Sidebar';
import Toolbar from '../Toolbar';
import Content from '../Content';

interface HomepageProps { }

const OuterContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
`;

const FixedFab = styled(Fab)`
  position: fixed !important;
  bottom: 15px;
  right: 15px;
`;

const Homepage: FC<HomepageProps> = () => {
  return (
    <OuterContainer>
      <Toolbar />
      <InnerContainer>
        <Sidebar />
        <Content />
      </InnerContainer>
      <FixedFab color="primary" aria-label="add">
        <AddRoundedIcon />
      </FixedFab>
    </OuterContainer>
  );
};

export default Homepage;
