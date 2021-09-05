import { FC } from 'react';
import logo from '@assets/logo-i2t4e.png';
import styled from 'styled-components';
import { Searchbar } from '@components/kit';

interface ToolbarProps {}

const StyledToolbar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 24px;
  & > img {
    margin-right: 160px;
  }
`;

const StyledSearchbar = styled(Searchbar)`
  width: 100%;
  max-width: 600px;
`;

const Toolbar: FC<ToolbarProps> = () => {
  return (
    <StyledToolbar>
      <img src={logo} alt="" />
      <StyledSearchbar
        enableTags={false}
        expand={false}
        placeholder="Search tables..."
      />
    </StyledToolbar>
  );
};

export default Toolbar;
