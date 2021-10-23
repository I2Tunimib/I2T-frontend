import { Stack, Typography } from '@mui/material';
import { FC } from 'react';
import { ReactComponent as EmptyImg } from '../../../assets/emptyImage.svg';

interface EmptyProps {
  title?: string;
}

const Empty: FC<EmptyProps> = ({ title = 'No data' }) => {
  return (
    <Stack alignItems="center">
      <EmptyImg width="87" height="64" />
      <Typography
        variant="body2"
        sx={{
          color: '#000000a6'
        }}>
        {title}
      </Typography>
    </Stack>
  );
};

export default Empty;
