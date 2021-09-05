import { IconButton, Typography } from '@material-ui/core';
import { FC } from 'react';
import MoreVertRoundedIcon from '@material-ui/icons/MoreVertRounded';
import styled from 'styled-components';

interface Contentprops {}

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-width: 1024px;
`;

const TableListItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 14px 12px 16px;
  border-bottom: 1px solid #ededed;

  &:hover {
    background-color: #FEF2F6;
    border-color: #FEF2F6;
  }

  & > p {
    width: 50%;
  }
`;

const StyledTypography = styled(Typography)`
  margin-bottom: 20px !important;
  &:not(:first-child) {
    margin-top: 20px !important;
  }
`;
const Content: FC<Contentprops> = () => {
  return (
    <StyledContent>
      <StyledTypography variant="h6">Today</StyledTypography>
      {[1, 2, 3, 4, 5].map((item) => (
        <TableListItem key={item}>
          <p>{`Table number ${item}`}</p>
          <Typography component="p" variant="body2" color="textSecondary">Last modified today at 1pm</Typography>
          <IconButton size="small">
            <MoreVertRoundedIcon />
          </IconButton>
        </TableListItem>
      ))}
      <StyledTypography variant="h6">Yesterday</StyledTypography>
      {[1, 2, 3, 4, 5].map((item) => (
        <TableListItem key={item}>
          <p>{`Table number ${item}`}</p>
          <Typography component="p" variant="body2" color="textSecondary">Last modified today at 1pm</Typography>
          <IconButton size="small">
            <MoreVertRoundedIcon />
          </IconButton>
        </TableListItem>
      ))}
    </StyledContent>
  );
};

export default Content;
