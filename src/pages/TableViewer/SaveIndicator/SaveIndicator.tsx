import { FC, HTMLAttributes, useState } from 'react';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import LoopRoundedIcon from '@material-ui/icons/LoopRounded';
import CloudDoneOutlinedIcon from '@material-ui/icons/CloudDoneOutlined';
import {
  Button,
  IconButton, Theme,
  Tooltip, Typography,
  withStyles
} from '@material-ui/core';
import clsx from 'clsx';
import { useAppSelector } from '@hooks/store';
import { selectLastChangeDate } from '@store/slices/table/table.selectors';
import TimeAgo from 'react-timeago';
import styles from './SaveIndicator.module.scss';
import timeAgoFormatter from './time-formatter';

interface SaveIndicatorProps extends HTMLAttributes<HTMLDivElement> { }
enum TooltipStatus {
  ERROR,
  PENDING,
  UNSAVED,
  SAVED
}
interface TooltipContentProps extends HTMLAttributes<HTMLDivElement> {
  status: TooltipStatus;
}

const LightTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 11,
    padding: 0
  }
}))(Tooltip);

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
          ? <CloudOffIcon className={styles.TooltipIcon} />
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
  className
}) => {
  const [status, setStatus] = useState<TooltipStatus>(TooltipStatus.UNSAVED);
  const lastChange = useAppSelector(selectLastChangeDate);
  // substitute with selector for http request
  const loading = false;

  return (
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
                    <CloudOffIcon
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
            {lastChange
              ? (
                <TimeAgo title="" formatter={timeAgoFormatter} date={lastChange} />
              )
              : 'No changes yet'
            }
          </Typography>
        </Button>
      </LightTooltip>
    </div>
  );
};

export default SaveIndicator;
