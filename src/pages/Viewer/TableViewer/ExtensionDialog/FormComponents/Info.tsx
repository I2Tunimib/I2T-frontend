import { Typography } from '@mui/material';
import { FC } from 'react';

export type InfoProps = {
  infoText: string;
  field: string;
}
/**
 * Textual information of a form field
 */
const Info: FC<InfoProps> = ({ infoText }) => {
  return <Typography>{infoText}</Typography>;
};

export default Info;
