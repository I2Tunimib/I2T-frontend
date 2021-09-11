import { CircularProgressWithLabel } from '@components/core';
import { IconButton, Typography } from '@material-ui/core';
import { RootState } from '@store';
import { selectUploadFileStatus } from '@store/slices/tables/tables.selectors';
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import { FC, useState } from 'react';
import { connect } from 'react-redux';
import { RequestUpload } from '@store/slices/tables/interfaces/tables';
import styles from './UploadProgressItem.module.scss';

interface UploadProgressItemProps {
  request: RequestUpload;
  onCancelRequest: (id: string) => void;
}

const UploadProgressItem: FC<UploadProgressItemProps> = ({
  request: {
    id,
    fileName,
    progress,
    status
  },
  // progress = 0,
  onCancelRequest
}) => {
  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={styles.ItemContainer}>
      <Typography>{fileName}</Typography>
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

// const mapStateToProps = (state: RootState, props: UploadProgressItemProps) => {
//   return {
//     progress: selectUploadFileStatus(state, props)
//   };
// };

// export default connect(mapStateToProps)(UploadProgressItem);
export default UploadProgressItem;
