import {
  FC, HTMLAttributes,
  useState, useEffect
} from 'react';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import LoopRoundedIcon from '@mui/icons-material/LoopRounded';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import {
  Button, IconButton,
  Theme, Tooltip, Typography, tooltipClasses
} from '@mui/material';
//import withStyles from '@mui/styles/withStyles';
import styled from '@emotion/styled';
import clsx from 'clsx';
import { useAppSelector } from '@hooks/store';
import TimeAgo from 'react-timeago';
import styles from './SaveIndicator.module.scss';
import timeAgoFormatter from './time-formatter';

interface SaveIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  value: string | undefined;
  lastSaved: string | undefined;
  loading: boolean;
}
enum TooltipStatus {
  ERROR,
  PENDING,
  UNSAVED,
  SAVED
}
interface TooltipContentProps extends HTMLAttributes<HTMLDivElement> {
  status: TooltipStatus;
}

/*
const LightTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 11,
    padding: 0
  }
}))(Tooltip);
*/

const LightTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 11,
    padding: 0,
  },
}));

const TooltipContent: FC<TooltipContentProps> = ({
  status
}) => {
  return (
    <div className={styles.Column}>
      <div className={clsx(
        styles.BaseTooltipHeader,
        {
          [styles.UnsavedChanges]: status === TooltipStatus.UNSAVED,
          [styles.SavedChanges]: status === TooltipStatus.SAVED
        }
      )}>
        {status === TooltipStatus.UNSAVED
          ? <ErrorOutlineRoundedIcon className={styles.TooltipIcon} />
          : <CloudDoneOutlinedIcon className={styles.TooltipIcon} />
        }
        <Typography variant="subtitle2">
          {status === TooltipStatus.UNSAVED
            ? (
              'You have unsaved changes'
            )
            : (
              'Your changes are up to date'
            )
          }
        </Typography>
      </div>
      <div className={styles.BaseTooltipBody}>
        <Typography variant="caption">
          {status === TooltipStatus.UNSAVED
            ? (
              'You have changes which have not been saved yet. Save the document to keep all changes.'
            )
            : (
              'Your latest changes are now saved. Your work can be closed safely.'
            )
          }
        </Typography>
      </div>
    </div>
  );
};

const SaveIndicator: FC<SaveIndicatorProps> = ({
  value,
  lastSaved,
  loading,
  className
}) => {
  const [status, setStatus] = useState<TooltipStatus | null>();

  useEffect(() => {
    if (!lastSaved) {
      setStatus(TooltipStatus.UNSAVED);
    }
    if (value && lastSaved) {
      const dateA = new Date(value);
      const dateB = new Date(lastSaved);

      if (dateB < dateA) {
        setStatus(TooltipStatus.UNSAVED);
      } else {
        setStatus(TooltipStatus.SAVED);
      }
    }
  }, [value, lastSaved]);

  return (
    status ? (
      <div className={styles.Container}>
        <LightTooltip
          title={(
            <TooltipContent status={status} />
          )}>
          <Button
            startIcon={
              loading
                ? (
                  <LoopRoundedIcon className={clsx(
                    styles.Icon,
                    styles.Loading
                  )} />
                )
                : [
                  status === TooltipStatus.SAVED
                    ? (
                      <CloudDoneOutlinedIcon
                        key="saved"
                        className={clsx(
                          styles.Icon,
                          styles.SavedChanges
                        )} />
                    )
                    : (
                      <ErrorOutlineRoundedIcon
                        key="unsaved"
                        className={clsx(
                          styles.Icon,
                          styles.UnsavedChanges
                        )} />
                    )
                ]
            }
            size="small"
            className={clsx(className, styles.Button)}>
            <Typography className={styles.LastChange} color="textSecondary" variant="body2">
              {value
                ? (
                  <TimeAgo title="" formatter={timeAgoFormatter} date={value} />
                )
                : 'No changes yet'
              }
            </Typography>
          </Button>
        </LightTooltip>
      </div>
    ) : null
  );
};

export default SaveIndicator;
