import { Typography } from '@mui/material';
import { FC } from 'react';

export type DescriptionProps = {
  description: string;
}
/**
 * Description of a service
 */
const Description: FC<DescriptionProps> = ({ description }) => {
  return <Typography>{description}</Typography>;
};

export default Description;
