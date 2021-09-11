import {
  CircularProgressProps,
  Box, CircularProgress,
  Typography
} from '@material-ui/core';
import { FC } from 'react';

interface CircularProgressWithLabelProps extends CircularProgressProps {
  value: number
}

const CircularProgressWithLabel: FC<CircularProgressWithLabelProps> = ({
  value,
  ...props
}) => {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="determinate" value={value} {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="caption" component="div" color="textSecondary">
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
};

export default CircularProgressWithLabel;
