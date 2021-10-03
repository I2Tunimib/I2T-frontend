import { CircularProgressWithLabel } from '@components/core';
import { IconButton, Typography } from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { FC, useState } from 'react';
import { RequestUpload } from '@store/slices/tables/interfaces/tables';
import { ID } from '@store/interfaces/store';
import styles from './UploadProgressItem.module.scss';

interface UploadProgressItemProps {
  request: RequestUpload;
  onCancelRequest: (id: ID) => void;
}

const UploadProgressItem: FC<UploadProgressItemProps> = ({
  request: {
    id,
    name,
    progress,
    status
  },
  onCancelRequest
}) => {
  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={styles.ItemContainer}>
      <Typography>{name}</Typography>
      {status === 'pending'
        ? (
          <>
            {hovered
              ? (
                <IconButton onClick={() => onCancelRequest(id)} size="small">
                  <CloseRoundedIcon />
                </IconButton>
              )
              : (
                <CircularProgressWithLabel
                  variant="determinate"
                  value={progress}
                />
              )}
          </>
        )
        : (
          <CheckCircleOutlineRoundedIcon className={styles.DoneIcon} />
        )
      }
    </div>
  );
};

export default UploadProgressItem;
