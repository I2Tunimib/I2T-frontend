import { MenuBase } from '@components/core';
import {
  Avatar,
  Button, Chip, makeStyles, PopperPlacementType,
  Slider, Typography
} from '@material-ui/core';
import {
  FC, useState,
  useEffect, useMemo
} from 'react';
import DoneRoundedIcon from '@material-ui/icons/DoneRounded';
import DoneIcon from '@material-ui/icons/Done';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { autoMatching, selectAutoMatchingCells } from '@store/slices/table/table.slice';
import { Cell } from '@store/slices/table/interfaces/table';
import styles from './AutoMatching.module.scss';

interface AutoMatchingProps {
  open: boolean;
  anchorElement: any;
  id?: string;
  placement?: PopperPlacementType | undefined;
  handleClose: () => void;
}

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

  const getNumberOfReconciliatedCells = (allCells: Cell[], thresholdReconciliation: number) => {
    return allCells.reduce((acc, cell) => {
      if (cell.metadata.values
        .some((metadataItem) => metadataItem.score >= thresholdReconciliation)) {
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
        </Typography>
        <div className={styles.Row}>
          <Chip
            color="primary"
            variant="outlined"
            size="medium"
            avatar={<Avatar>{reconciliatedCells}</Avatar>}
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
          onChange={handleChange}
        />
        <Button onClick={handleConfirm} color="primary" className={styles.ConfirmButton}>Confirm</Button>
      </div>
    </MenuBase>
  );
};

export default AutoMatching;
