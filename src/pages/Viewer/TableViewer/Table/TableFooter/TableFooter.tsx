import { useAppDispatch, useAppSelector } from '@hooks/store';
import { Button, Pagination, Typography } from '@mui/material';
import { selectIsViewOnly } from '@store/slices/table/table.selectors';
import { updateUI } from '@store/slices/table/table.slice';
import styles from './TableFooter.module.scss';

interface TableFooterProps {
  /**
   * Rows of the table.
   */
  rows: any[];
  columns: any[];
  paginatorProps: PaginatorProps;
}

interface PaginatorProps {
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

/**
 * Table footer element.
 */
const TableFooter = ({
  rows,
  columns,
  paginatorProps
}: TableFooterProps) => {
  const { gotoPage, pageCount, pageIndex } = paginatorProps;
  const isViewOnly = useAppSelector(selectIsViewOnly);
  const dispatch = useAppDispatch();

  const handleChange = (event: any, page: number) => {
    gotoPage(page - 1);
  };

  return (
    <div className={styles.TableFooter}>
      <Typography color="textSecondary" variant="body2">
        {`Total columns: ${columns.length}`}
      </Typography>
      <Typography color="textSecondary" variant="body2">
        {`Total rows: ${rows.length}`}
      </Typography>
      <Button sx={{ textTransform: 'none' }} size="small" variant="outlined" onClick={() => dispatch(updateUI({ viewOnly: !isViewOnly }))}>
        {isViewOnly ? 'Enable changes' : 'Disable changes'}
      </Button>
      <Pagination
        onChange={handleChange}
        count={pageCount}
        page={pageIndex + 1}
        showFirstButton
        showLastButton />
    </div>
  );
};

export default TableFooter;
