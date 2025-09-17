import { ActionGroup, Battery, StatusBadge } from '@components/core';
import { useAppSelector } from '@hooks/store';
import { Pagination, Stack, Typography } from '@mui/material';
import { selectColumnsAnnotationPercentages, selectCurrentTable } from '@store/slices/table/table.selectors';
import { useEffect } from 'react';
import styles from './TableFooter.module.scss';

interface TableFooterProps {
  /**
   * Rows of the table.
   */
  rows: any[];
  columns: any[];
  table: any;
  pageIndex: number;
}

/**
 * Table footer element.
 */
const TableFooter = ({
  rows,
  columns,
  table,
  pageIndex,
}: TableFooterProps) => {
  const visibleColumnCount = Object.values(table.getState().columnVisibility).filter(Boolean).length;
  const pageCount = visibleColumnCount === 0 ? 0 : table.getPageCount();
  const { nCells = 0, nCellsReconciliated = 0 } = useAppSelector(selectCurrentTable);
  const columnAnnotationPercentages = useAppSelector(selectColumnsAnnotationPercentages);

  const handleChange = (event: any, page: number) => {
    table.setPageIndex(page - 1);
  };

  // console.log(nCells);
  // console.log(nCellsReconciliated);

  return (
    <div className={styles.TableFooter}>
      <Stack direction="row" alignItems="center" gap="10px">
        <ActionGroup>
          <Typography color="textSecondary" variant="body2">
            {`Total columns: ${columns.length}`}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {`Total rows: ${table.getFilteredRowModel().rows.length}`}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            Completion:
          </Typography>
          <Battery value={nCells > 0 ? (nCellsReconciliated / nCells) * 100 : 0} />
        </ActionGroup>
        {columnAnnotationPercentages && (
          <ActionGroup>
            <Stack direction="row" alignItems="center" gap="10px">
              <Typography color="textSecondary" variant="body2">
                Columns annotations status:
              </Typography>
              <Stack direction="row" alignItems="center" gap="10px">
                <Stack direction="row" alignItems="center" gap="5px">
                  <StatusBadge status="miss" size="small" />
                  <Typography color="textSecondary" variant="body2">
                    {`${columnAnnotationPercentages.miss.percentage}%`}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap="5px">
                  <StatusBadge status="warn" size="small" />
                  <Typography color="textSecondary" variant="body2">
                    {`${columnAnnotationPercentages.pending.percentage}%`}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap="5px">
                  <StatusBadge status="match-reconciliator" size="small" />
                  <Typography color="textSecondary" variant="body2">
                    {`${columnAnnotationPercentages.match.percentage}%`}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </ActionGroup>
        )}
      </Stack>
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
