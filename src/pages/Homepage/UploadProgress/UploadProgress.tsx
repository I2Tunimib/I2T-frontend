import {
  Collapse, IconButton,
  Paper, Typography
} from '@material-ui/core';
import clsx from 'clsx';
import PublishRoundedIcon from '@material-ui/icons/PublishRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@material-ui/icons/ExpandLessRounded';
import {
  FC, HTMLAttributes,
  useState, useEffect
} from 'react';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { updateUI } from '@store/slices/tables/tables.slice';
import { selectNumberOfActiveUploadRequests, selectUploadRequests } from '@store/slices/tables/tables.selectors';
import { useFirstRender } from '@hooks/first-render/useFirstRender';
import styles from './UploadProgress.module.scss';
import UploadProgressItem from './UploadProgressItem';

interface UploadProgressProps extends HTMLAttributes<HTMLDivElement> {
  onCancelRequest: (id: string) => void;
}

/**
 * Show upload progress for active requests.
 */
const UploadProgress: FC<UploadProgressProps> = ({
  className,
  ...props
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const firstRender = useFirstRender();
  const requests = useAppSelector(selectUploadRequests);
  const numberOfUploadingFiles = useAppSelector(selectNumberOfActiveUploadRequests);

  useEffect(() => {
    // when no more requets close the dialog
    if (!firstRender && requests.length === 0) {
      dispatch(updateUI({ uploadProgressDialogOpen: false }));
    }
  }, [requests]);

  return (
    <Paper elevation={3} className={clsx(styles.List, className)}>
      <div className={styles.Header}>
        <PublishRoundedIcon />
        <Typography variant="subtitle2">
          {numberOfUploadingFiles > 0
            ? `Uploading ${numberOfUploadingFiles} files`
            : 'Done uploading'}
        </Typography>
        <IconButton size="small" onClick={() => setCollapsed((state) => !state)}>
          {collapsed ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
        </IconButton>
        <IconButton
          size="small"
          onClick={() => dispatch(updateUI({
            uploadProgressDialogOpen: false
          }))}>
          <CloseRoundedIcon />
        </IconButton>
      </div>
      <Collapse in={!collapsed}>
        {requests.map((request) => (
          <UploadProgressItem
            key={request.id}
            request={request}
            {...props}
          />
        ))}
      </Collapse>
    </Paper>
  );
};

export default UploadProgress;
