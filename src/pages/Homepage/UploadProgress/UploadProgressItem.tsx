import { CircularProgressWithLabel } from '@components/core';
import { IconButton, Typography } from '@material-ui/core';
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import { FC, useState } from 'react';
import { RequestUpload } from '@store/slices/tables/interfaces/tables';
import styles from './UploadProgressItem.module.scss';

interface UploadProgressItemProps {
  request: RequestUpload;
  onCancelRequest: (id: string) => void;
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
