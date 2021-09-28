/* eslint-disable react/destructuring-assignment */
import { Badge, Checkbox, Chip } from '@material-ui/core';
import LinkRoundedIcon from '@material-ui/icons/LinkRounded';
import ErrorOutlineRoundedIcon from '@material-ui/icons/ErrorOutlineRounded';
import clsx from 'clsx';
import { ButtonShortcut } from '@components/kit';
import { ColumnStatus } from '@store/slices/table/interfaces/table';
import { RootState } from '@store';
import { connect } from 'react-redux';
import { selectColumnReconciliators } from '@store/slices/table/table.selectors';
import { forwardRef } from 'react';
import styles from './TableHeaderCell.module.scss';
import TableHeaderCellExpanded from './TableHeaderCellExpanded';

/**
 * Table head cell.
 */
// eslint-disable-next-line no-undef
const TableHeaderCell = forwardRef<HTMLTableHeaderCellElement>(({
  id,
  selected,
  children,
  handleCellRightClick,
  handleSelectedColumnChange,
  reconciliators,
  data
}: any, ref) => {
  return (
    <th
      ref={ref}
      onClick={(e) => handleSelectedColumnChange(e, id)}
      onContextMenu={(e) => handleCellRightClick(e, 'column', id)}
      className={clsx([
        styles.TableHeaderCell,
        {
          [styles.Selected]: selected,
          [styles.TableHeaderIndex]: id === 'index'
        }
      ])}>
      <div className={styles.TableHeaderContent}>
        {id !== 'index' ? (
          <div className={styles.Row}>
            <div className={styles.Column}>
              <div className={styles.Row}>
                {data.role && <ButtonShortcut text={data.role} />}
                <div className={styles.Label}>
                  {children}
                </div>
              </div>
              {data.status === ColumnStatus.RECONCILIATED ? (
                <div className={styles.Row}>
                  <Chip
                    icon={<LinkRoundedIcon />}
                    label={reconciliators.join(' | ')}
                    variant="outlined"
                    size="small"
                    color="primary"
                  />
                </div>
              ) : [
                data.status === ColumnStatus.PENDING ? (
                  <Chip
                    icon={<ErrorOutlineRoundedIcon />}
                    label="Partial annotation"
                    variant="outlined"
                    size="small"
                    color="primary"
                  />
                ) : (
                  null
                )
              ]}
            </div>
            {data.expanded && <TableHeaderCellExpanded {...data} />}
          </div>
        ) : (
          <>
            {children}
          </>
        )}
      </div>
    </th>
  );
});

const mapStateToProps = (state: RootState, props: any) => {
  return {
    reconciliators: selectColumnReconciliators(state, props)
  };
};

export default connect(mapStateToProps, null, null, { forwardRef: true })(TableHeaderCell);
