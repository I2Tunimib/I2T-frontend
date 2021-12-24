import styled from '@emotion/styled';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { Stack, Typography, Chip, Avatar, Slider, Button, Box } from '@mui/material';
import { Cell } from '@store/slices/table/interfaces/table';
import DoneIcon from '@mui/icons-material/Done';
import { selectAutoMatchingCells, selectSettings } from '@store/slices/table/table.selectors';
import { useState, useEffect, useMemo, FC } from 'react';
import { autoMatching, updateUI } from '@store/slices/table/table.slice';

type ScoreRefineMatchingProps = {
  handleClose: () => void;
};

const Emph = styled.span({
  backgroundColor: '#f2f2f2',
  padding: '2px 3px',
  boxShadow: 'inset 0 -2px #ebefff',
  borderRadius: '6px',
  marginLeft: '5px'
});

const ScoreRefineMatching: FC<ScoreRefineMatchingProps> = ({
  handleClose
}) => {
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
  const dispatch = useAppDispatch();

  const getNumberOfReconciliatedCells = (allCells: Cell[], thresholdReconciliation: number) => {
    return allCells.reduce((acc, cell) => {
      if (cell.metadata.some(({ score = 0 }) => score >= thresholdReconciliation)) {
        return acc + 1;
      }
      return acc;
    }, 0);
  };

  useEffect(() => {
    // let
    // if (scoreLowerBound != null) {
    //   tmpThreshold = scoreLowerBound > maxScore ? maxScore : threshold;
    // }
    // const
    // setThreshold()

    setReconciliatedCells(
      getNumberOfReconciliatedCells(selectedCells, threshold)
    );
  }, [selectedCells, threshold]);

  useEffect(() => {
    if (scoreLowerBound) {
      const tmp = Number(scoreLowerBound.toFixed(2));
      setThreshold(tmp > maxScore ? maxScore : tmp);
    }
  }, [scoreLowerBound, maxScore]);

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

  // console.log(maxScore);

  return (
    <Stack padding="10px" maxWidth="400px">
      <Typography variant="h6" gutterBottom>
        Score refine matching
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Choose a threshold to renconcile selected cells.
        The lower bound for the table is currently set to
        <Emph>{scoreLowerBound != null ? scoreLowerBound.toFixed(2) : 0}</Emph>
      </Typography>
      <Stack direction="row" alignItems="center" marginLeft="auto" marginRight="auto" gap="5px">
        <Chip
          color="primary"
          variant="outlined"
          size="medium"
          avatar={(
            <Avatar key={reconciliatedCells}>
              {reconciliatedCells}
            </Avatar>
          )}
          label="Reconciliated cells"
          deleteIcon={<DoneIcon />}
        />
        /
        <Chip size="medium" variant="outlined" avatar={<Avatar>{n}</Avatar>} label="Selected cells" />
      </Stack>
      <Box padding="60px">
        <Slider
          valueLabelDisplay="on"
          marks={marks}
          value={threshold}
          min={minScore}
          max={maxScore}
          step={0.01}
          onChange={handleChange}
        />
      </Box>
      <Stack direction="row" justifyContent="flex-end">
        <Button onClick={() => handleClose()} color="primary">Cancel</Button>
        <Button onClick={handleConfirm} color="primary">Confirm</Button>
      </Stack>
    </Stack>
  );
};

export default ScoreRefineMatching;
