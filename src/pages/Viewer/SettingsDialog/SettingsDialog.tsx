import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
  FormControl,
  FormHelperText,
  Slider,
  Stack,
  styled,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { FC, useState, useEffect, ChangeEvent, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import {
  selectCurrentTable,
  selectSettings,
} from "@store/slices/table/table.selectors";
import SettingsIcon from "@mui/icons-material/Settings";
import { updateUI } from "@store/slices/table/table.slice";

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
