import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogProps, DialogTitle, FormControl, FormHelperText, Slider, Stack, styled, Switch, TextField, Tooltip, Typography } from '@mui/material';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { FC, useState, useEffect, ChangeEvent, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@hooks/store';
import { selectCurrentTable, selectSettings } from '@store/slices/table/table.selectors';
import SettingsIcon from '@mui/icons-material/Settings';
import { updateUI } from '@store/slices/table/table.slice';

const Root = styled('span')`
  font-size: 0;
  position: relative;
  display: inline-block;
  width: 38px;
  height: 20px;
  margin: 10px;
  cursor: pointer;

  &.Mui-disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  & .MuiSwitch-track {
    background: #b3c3d3;
    border-radius: 10px;
    display: block;
    height: 100%;
    width: 100%;
    position: absolute;
  }

  & .MuiSwitch-thumb {
    display: block;
    width: 19px;
    height: 14px;
    top: 3px;
    left: 3px;
    border-radius: 16px;
    background-color: #fff;
    position: relative;
    transition: all 200ms ease;
  }

  &.Mui-focusVisible .MuiSwitch-thumb {
    background-color: rgba(255, 255, 255, 1);
    box-shadow: 0 0 1px 8px rgba(0, 0, 0, 0.25);
  }

  &.Mui-checked {
    .MuiSwitch-thumb {
      left: 14px;
      top: 3px;
      background-color: #fff;
    }

    .MuiSwitch-track {
      background: #007fff;
    }
  }

  & .MuiSwitch-input {
    cursor: inherit;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
    z-index: 1;
    margin: 0;
  }
`;


type TmpSettingsState = {
  isViewOnly: boolean;
  scoreLowerBoundEnabled: boolean;
  scoreLowerBound: number;
};

type DialogSettingsContentProps = {
  onFormChange: (state: TmpSettingsState | null) => void;
};

const DialogSettingsContent: FC<DialogSettingsContentProps> = ({
  onFormChange,
}) => {
  const [tmpSettingsState, setTmpSettingsState] =
    useState<TmpSettingsState | null>(null);
  const settings = useAppSelector(selectSettings);
  const currentTable = useAppSelector(selectCurrentTable);

  useEffect(() => {
    const {
      isViewOnly,
      lowerBound: {
        isScoreLowerBoundEnabled,
        minMetaScore = 0,
        maxMetaScore = 0,
        scoreLowerBound = 0,
      },
    } = settings;

    setTmpSettingsState({
      isViewOnly: !!isViewOnly,
      scoreLowerBoundEnabled: !!isScoreLowerBoundEnabled,
      scoreLowerBound: Number(
        (scoreLowerBound === 0
          ? (maxMetaScore - minMetaScore) / 3
          : scoreLowerBound
        ).toFixed(2)
      ),
    });
  }, [settings]);

  useEffect(() => {
    onFormChange(tmpSettingsState);
  }, [tmpSettingsState]);

  const handleViewOnlyChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTmpSettingsState((old) => {
      if (old) {
        return { ...old, isViewOnly: !old.isViewOnly };
      }
      return null;
    });
  };

  const handleLowerBoundToggleChange = () => {
    setTmpSettingsState((old) => {
      if (old) {
        return { ...old, scoreLowerBoundEnabled: !old.scoreLowerBoundEnabled };
      }
      return null;
    });
  };

  const handleLowerBoundScoreChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setTmpSettingsState((old) => {
      if (old) {
        return { ...old, scoreLowerBound: Number(event.target.value) };
      }
      return null;
    });
  };

  return tmpSettingsState ? (
    <Stack>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" gap="10px">
          <Typography sx={{ flexShrink: 0 }}>Enable changes</Typography>
          <Tooltip
            arrow
            placement="right"
            title="Enable or disable changes to the table. Changes are disabled by default if an automatic annotation process is in progress."
          >
            <HelpOutlineRoundedIcon color="disabled" />
          </Tooltip>
        </Stack>
        <Switch
          component={Root}

          checked={!tmpSettingsState.isViewOnly}
          disabled={currentTable.mantisStatus === "PENDING"}
          onChange={handleViewOnlyChange}
        />
      </Stack>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" gap="10px">
          <Typography sx={{ flexShrink: 0 }}>
            Enable metadata score lower bound
          </Typography>
          <Tooltip
            arrow
            placement="right"
            title="By enabling the metadata score lower bound you can set minimum acceptance threshold for a metadata score."
          >
            <HelpOutlineRoundedIcon color="disabled" />
          </Tooltip>
        </Stack>
        <Switch
          component={Root}

          checked={tmpSettingsState.scoreLowerBoundEnabled}
          onChange={handleLowerBoundToggleChange}
        />
      </Stack>
      {tmpSettingsState.scoreLowerBoundEnabled ? (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" gap="10px">
            <Typography sx={{ flexShrink: 0 }}>Min. score threshold</Typography>
            <Tooltip
              arrow
              placement="right"
              title="Set the lower bound score for choosing a match metadata for a cell. Cells with metadata scores LOWER than this threshold are marked in RED."
            >
              <HelpOutlineRoundedIcon color="disabled" />
            </Tooltip>
          </Stack>
          <FormControl variant="outlined">
            <TextField
              size="small"
              type="number"
              label="Threshold"
              variant="outlined"
              onChange={handleLowerBoundScoreChange}
              value={Number(tmpSettingsState.scoreLowerBound)}
            />
            <FormHelperText>
              {`Min is ${settings.lowerBound.minMetaScore?.toFixed(
                2
              )}, Max is ${settings.lowerBound.maxMetaScore?.toFixed(2)}`}
            </FormHelperText>
          </FormControl>
        </Stack>
      ) : null}
    </Stack>
  ) : null;
};

const SettingsDialog: FC<DialogProps> = ({ ...props }) => {
  const [state, setState] = useState<TmpSettingsState | null>();
  const dispatch = useAppDispatch();

  const onFormChange = (formState: TmpSettingsState | null) => {
    setState(formState);
  };

  const handleConfirm = () => {
    dispatch(
      updateUI({
        settingsDialog: false,
        ...(state && {
          settings: {
            isViewOnly: state.isViewOnly,
            isScoreLowerBoundEnabled: state.scoreLowerBoundEnabled,
            scoreLowerBound: state.scoreLowerBound,
          },
        }),
      })
    );
  };

  return (
    <Dialog {...props}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
        Table settings
        <SettingsIcon color="disabled" />
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Settings of the table viewer can be changed here:
        </DialogContentText>
        <DialogSettingsContent onFormChange={onFormChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => dispatch(updateUI({ settingsDialog: false }))}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleConfirm}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;
