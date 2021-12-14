import { MenuBase } from '@components/core';
import {
  Avatar,
  Button, Chip, PopperPlacementType,
  Slider, Typography
} from '@mui/material';
import {
  FC, useState,
  useEffect, useMemo
} from 'react';
import DoneIcon from '@mui/icons-material/Done';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { autoMatching } from '@store/slices/table/table.slice';
import { Cell } from '@store/slices/table/interfaces/table';
import { selectAutoMatchingCells, selectSettings } from '@store/slices/table/table.selectors';
import styled from '@emotion/styled';
import styles from './AutoMatching.module.scss';

interface AutoMatchingProps {
  open: boolean;
  anchorElement: any;
  id?: string;
  placement?: PopperPlacementType | undefined;
  handleClose: () => void;
}

const Emph = styled.span({
  backgroundColor: '#f2f2f2',
  padding: '2px 3px',
  boxShadow: 'inset 0 -2px #ebefff',
  borderRadius: '6px',
  marginLeft: '5px'
});

const AutoMatching: FC<AutoMatchingProps> = ({
  open,
  anchorElement,
  handleClose
}) => {
  const dispatch = useAppDispatch();
  const [reconciliatedCells, setReconciliatedCells] = useState<number>(30);
  const [threshold, setThreshold] = useState<number>(0);
  const {
    selectedCells, n,
    minScore, maxScore
  } = useAppSelector(selectAutoMatchingCells);
  const {
    lowerBound: {
      scoreLowerBound
    }
  } = useAppSelector(selectSettings);

  const getNumberOfReconciliatedCells = (allCells: Cell[], thresholdReconciliation: number) => {
    return allCells.reduce((acc, cell) => {
      if (cell.metadata.some(({ score = 0 }) => score >= thresholdReconciliation)) {
        return acc + 1;
      }
      return acc;
    }, 0);
  };

  useEffect(() => {
    setReconciliatedCells(
      getNumberOfReconciliatedCells(selectedCells, threshold)
    );
  }, [selectedCells, threshold]);

  useEffect(() => {
    if (scoreLowerBound) {
      setThreshold(Number(scoreLowerBound.toFixed(2)));
    }
  }, [scoreLowerBound]);

  const handleChange = (event: any, newValue: number | number[]) => {
    setThreshold(newValue as number);
  };

  const handleConfirm = () => {
    dispatch(autoMatching({ threshold }));
    handleClose();
  };

  const marks = useMemo(() => [
    {
      value: minScore,
      label: minScore.toString()
    },
    {
      value: maxScore,
      label: maxScore.toString()
    }
  ], [minScore, maxScore]);

  return (
    <MenuBase
      open={open}
      anchorElement={anchorElement}
      handleClose={handleClose}>
      <div className={styles.MenuContent}>
        <Typography variant="h6" gutterBottom>
          Auto matching
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Choose a threshold to renconcile selected cells.
          The lower bound for the table is currently set to
          <Emph>{scoreLowerBound != null ? scoreLowerBound.toFixed(2) : 0}</Emph>
        </Typography>
        <div className={styles.Row}>
          <Chip
            color="primary"
            variant="outlined"
            size="medium"
            avatar={(
              <Avatar className={styles.NumberOfReconciliatedCells} key={reconciliatedCells}>
                {reconciliatedCells}
              </Avatar>
            )}
            label="Reconciliated cells"
            deleteIcon={<DoneIcon />}
          />
          /
          <Chip size="medium" variant="outlined" avatar={<Avatar>{n}</Avatar>} label="Selected cells" />
        </div>
        <Slider
          className={styles.Slider}
          valueLabelDisplay="on"
          marks={marks}
          value={threshold}
          min={minScore}
          max={maxScore}
          step={0.01}
          onChange={handleChange}
        />
        <Button onClick={handleConfirm} color="primary" className={styles.ConfirmButton}>Confirm</Button>
      </div>
    </MenuBase>
  );
};

export default AutoMatching;
