/* eslint-disable react/destructuring-assignment */
import { Chip, Stack } from '@mui/material';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import clsx from 'clsx';
import { ButtonShortcut } from '@components/kit';
import { ColumnStatus } from '@store/slices/table/interfaces/table';
import { RootState } from '@store';
import { connect } from 'react-redux';
import { selectColumnReconciliators } from '@store/slices/table/table.selectors';
import { forwardRef } from 'react';
import { capitalize } from '@services/utils/text-utils';
import styles from './TableHeaderCell.module.scss';
import TableHeaderCellExpanded from './TableHeaderCellExpanded';

const getKind = (kind: string) => {
  if (kind === 'entity') {
    return <ButtonShortcut text="Named Entity" size="xs" variant="flat" color="blue" />;
  }
  if (kind === 'literal') {
    return <ButtonShortcut text="Literal" size="xs" variant="flat" color="green" />;
  }
  return null;
};

/**
 * Table head cell.
 */
// eslint-disable-next-line no-undef
const TableHeaderCell = forwardRef<HTMLTableHeaderCellElement>(({
  id,
  selected,
  expanded,
  children,
  handleCellRightClick,
  handleSelectedColumnChange,
  reconciliators,
  highlightState,
  data
}: any, ref) => {
  return (
    <th
      ref={ref}
      onClick={(e) => handleSelectedColumnChange(e, id)}
      onContextMenu={(e) => handleCellRightClick(e, 'column', id)}
      style={{
        borderTop: highlightState && highlightState.columns.includes(id) ? `2px solid ${highlightState.color}` : '',
        backgroundColor: highlightState && highlightState.columns.includes(id) ? `${highlightState.color}10` : ''
      }}
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
                <div className={styles.Label}>
                  {children}
                </div>
                {data.kind && getKind(data.kind)}
                {data.role
                  && <ButtonShortcut className={styles.SubjectLabel} text={capitalize(data.role)} variant="flat" color="darkblue" size="xs" />}
              </div>
              {data.status === ColumnStatus.RECONCILIATED ? (
                <Stack
                  sx={{
                    fontSize: '12px'
                  }}
                  direction="row"
                  gap="5px"
                  alignItems="center">
                  <LinkRoundedIcon />
                  {reconciliators ? reconciliators.join(' | ') : data.reconciliator}
                </Stack>
              ) : data.status === ColumnStatus.PENDING ? (
                <Stack
                  sx={{
                    fontSize: '12px'
                  }}
                  direction="row"
                  gap="5px"
                  alignItems="center">
                  <LinkRoundedIcon />
                  Partial annotation
                </Stack>
              ) : null
              }
            </div>
            {expanded && <TableHeaderCellExpanded {...data} />}
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
