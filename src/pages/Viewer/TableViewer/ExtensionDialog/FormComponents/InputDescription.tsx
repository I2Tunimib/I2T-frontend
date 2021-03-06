/* eslint-disable react/no-danger */
import { Stack, Tooltip } from '@mui/material';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { FC } from 'react';
import styled from '@emotion/styled';

export type InputDescriptionProps = {
  description: string;
  infoText?: string;
}

const InfoIcon = styled(HelpOutlineRoundedIcon)`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  color: grey;
`;

/**
 * Description of an input with helper text
 */
const InputDescription: FC<InputDescriptionProps> = ({
  description,
  infoText
}) => {
  return (
    <Stack position="relative" direction="row" marginRight="30px">
      <div dangerouslySetInnerHTML={{ __html: description }} />
      {infoText && (
        <Tooltip title={infoText} placement="left" arrow>
          <InfoIcon />
        </Tooltip>
      )}
    </Stack>
  );
};

export default InputDescription;
