import styled from '@emotion/styled';
import { Stack, Typography } from '@mui/material';

const Letter = styled.span({
  fontSize: '96px'
});

const NotFound = () => {
  return (
    <Stack sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      <Stack sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'rgb(61 71 82 / 25%) 0px 4px 20px',
        padding: '64px',
        borderRadius: '12px'
      }}>
        <Stack
          direction="row">
          <Letter>4</Letter>
          <Letter>0</Letter>
          <Letter>4</Letter>
        </Stack>
        <Typography variant="h6">Page not found</Typography>
      </Stack>
    </Stack>
  );
};

export default NotFound;
