/* eslint-disable react/destructuring-assignment */
import { IconButton, Stack } from '@mui/material';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import clsx from 'clsx';
import { ButtonShortcut } from '@components/kit';
import { ColumnStatus } from '@store/slices/table/interfaces/table';
import { RootState } from '@store';
import { connect } from 'react-redux';
import { selectColumnReconciliators } from '@store/slices/table/table.selectors';
import { forwardRef, MouseEvent, useCallback } from 'react';
import { capitalize } from '@services/utils/text-utils';
import { StatusBadge } from '@components/core';
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
  handleSelectedColumnCellChange,
  reconciliators,
  highlightState,
  data,
  settings
}: any, ref) => {
  const {
    lowerBound
  } = settings;

  const handleSelectColumn = (event: MouseEvent) => {
    event.stopPropagation();
    handleSelectedColumnChange(event, id);
  };

  const getBadgeStatus = useCallback((column: any) => {
    const {
      annotationMeta: {
        match,
        highestScore
      }
    } = column;

    if (match) {
      return 'Success';
    }

    const {
      isScoreLowerBoundEnabled,
      scoreLowerBound
    } = lowerBound;

    if (isScoreLowerBoundEnabled) {
      if (
        column.metadata.length > 0
        && column.metadata[0].entity
        && column.metadata[0].entity.length === 0) {
        return 'Error';
      }

      if (scoreLowerBound != null && highestScore < scoreLowerBound) {
        return 'Error';
      }
    }
    return 'Warn';
  }, [lowerBound]);

  return (
    <th
      ref={ref}
      onClick={(e) => handleSelectedColumnCellChange(e, id)}
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
          <>
            <IconButton onClick={handleSelectColumn} size="small" className={styles.ColumnSelectionButton}>
              <CheckCircleOutlineRoundedIcon fontSize="medium" />
            </IconButton>
            <div className={styles.Row}>
              <div className={styles.Column}>
                <div className={styles.Row}>
                  {data.annotationMeta && data.annotationMeta.annotated && (
                    <StatusBadge status={getBadgeStatus(data)} size="small" marginRight="5px" />
                  )}
                  {/* {!!(data.metadata.length > 0
                    && data.metadata[0].entity
                    && data.metadata[0].entity.length > 0) && (
                    <StatusBadge status={getBadgeStatus(data)} size="small" marginRight="5px" />
                  )} */}
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
          </>
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
