import { IconButton, Typography } from '@material-ui/core';
import { FC } from 'react';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';
import styles from './Paginator.module.scss';

export interface PaginatorProps {
  canPreviousPage: boolean;
  canNextPage: boolean;
  pageOptions: number[];
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  gotoPage: (updater: number | ((pageIndex: number) => number)) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (pageSize: number) => void;
}

const Paginator: FC<PaginatorProps> = ({
  canPreviousPage,
  canNextPage,
  pageOptions,
  pageCount,
  pageIndex,
  pageSize,
  gotoPage,
  nextPage,
  previousPage,
  setPageSize
}) => {
  return (
    <div className={styles.Container}>
      <Typography color="textSecondary" variant="body2">
        {`Pages: ${pageIndex + 1}/${pageCount}`}
      </Typography>
      <IconButton
        disabled={!canPreviousPage}
        onClick={() => previousPage()}
        color="primary"
        size="small">
        <ArrowBackIosRoundedIcon className={styles.Icon} />
      </IconButton>
      <IconButton
        disabled={!canNextPage}
        onClick={() => nextPage()}
        color="primary"
        size="small">
        <ArrowForwardIosRoundedIcon className={styles.Icon} />
      </IconButton>
    </div>
  );
};

export default Paginator;
