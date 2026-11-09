import { useAppDispatch, useAppSelector } from "@hooks/store";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { HelpOutline } from "@mui/icons-material";
import {
  selectIsUploadDatasetDialogOpen,
  selectUploadDatasetStatus,
  selectDatasets,
} from "@store/slices/datasets/datasets.selectors";
import { updateUI } from "@store/slices/datasets/datasets.slice";
//import { LoadingButton } from "@mui/lab";
import { ChangeEvent, useState, FocusEvent, useRef, useEffect } from "react";
import { uploadDataset } from "@store/slices/datasets/datasets.thunk";
import { useSnackbar } from "notistack";
import ToolbarTutorialDialog from "@pages/Dashboard/ToolbarTutorialDialog/ToolbarTutorialDialog";

type ErrorState = Record<string, string>;

const supportedFormats = ["zip", "rar"];

const UploadDataset = () => {
  const [datasetName, setDatasetName] = useState<string>("");
  const [datasetFile, setDatasetFile] = useState<File>();
  const [error, setError] = useState<ErrorState>({});
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const isOpen = useAppSelector(selectIsUploadDatasetDialogOpen);
  const datasetData = useAppSelector(selectDatasets);
  const existingDatasets = datasetData?.collection || [];

  const { loading, error: uploadError } = useAppSelector(
    selectUploadDatasetStatus
  );

  const resetForm = () => {
    setDatasetName("");
    setDatasetFile(undefined);
    setError({});
    if (ref && ref.current) {
      ref.current.value = "";
    }
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleClose = () => {
    resetForm();
    dispatch(updateUI({ uploadDatasetDialogOpen: false }));
  };

  const getUniqueDatasetName = (name: string) => {
    const baseName = name.trim() === "" ? "Unnamed dataset" : name.trim();
    const existingNames = new Set(existingDatasets.map((t: any) => t.name));

    if (!existingNames.has(baseName)) {
      return { uniqueName: baseName, wasRenamed: false };
    }

    let counter = 1;
    let newName = `${baseName}_${counter}`;
    while (existingNames.has(newName)) {
      counter++;
      newName = `${baseName}_${counter}`;
    }

    return { uniqueName: newName, wasRenamed: true };
  };

  const handleConfirm = () => {
    if (!datasetName) {
      setError((old) => ({ ...old, name: "A name must be set" }));
    }

    if (datasetName) {
      const { uniqueName, wasRenamed } = getUniqueDatasetName(datasetName);
      const formData = new FormData();
      if (datasetFile) formData.append("file", datasetFile);
      formData.append("name", uniqueName);
      dispatch(uploadDataset({ formData }))
        .unwrap()
        .then(() => {
          if (wasRenamed) {
            enqueueSnackbar("Dataset name provided already exists. A numeric suffix has been added.", {
              variant: "info",
              autoHideDuration: 3000,
            });
          }
          resetForm();
          handleClose();
        });
    }
  };

  const handleNameChange = (event: FocusEvent<HTMLInputElement>) => {
    setDatasetName(event.target.value);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files && files.length === 1) {
      const file = files[0];
      const splittedName = file.name.split(".");

      if (supportedFormats.includes(splittedName[splittedName.length - 1])) {
        if (datasetName === "") {
          setDatasetName(splittedName[0]);
        }
        setDatasetFile(files[0]);
      }
    }
    if (ref && ref.current) {
      ref.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        Add dataset
        <IconButton
          aria-label="help-dataset"
          onClick={() => setTutorialOpen(true)}
          size="small"
          sx={{ ml: 1 }}
        >
          <HelpOutline />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          <p>
            Select a dataset to upload (.zip) or insert a <b>Dataset Name</b> to
            create an empty one.
          </p>
          <p>
            Each dataset should contain one or more tables. Please refer to the
            <b> (?) </b>
            for more information about the supported table formats.
          </p>
        </DialogContentText>
        <Stack padding="10px 0" gap="10px">
          <TextField
            error={!!error.name}
            helperText={error.name}
            value={datasetName}
            onChange={handleNameChange}
            label="Dataset name"
            variant="outlined"
          />
          <Stack direction="row" alignItems="center" gap="10px">
            <Button
              sx={{
                alignSelf: "flex-start",
                textTransform: "none",
              }}
              size="medium"
              component="label"
              color="primary"
              variant="contained"
            >
              Select file (.zip or .rar)
              <input
                ref={ref}
                type="file"
                onChange={handleFileChange}
                multiple
                hidden
              />
            </Button>
            {datasetFile && <Typography>{datasetFile.name}</Typography>}
          </Stack>
          {uploadError && (
            <Typography color="error">{uploadError.message}</Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          loading={loading && !uploadError}
          disabled={datasetName === ""}
          color="primary"
          onClick={handleConfirm}
        >
          Confirm
        </Button>
      </DialogActions>
      <ToolbarTutorialDialog
        open={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        initialStep={1}
      />
    </Dialog>
  );
};

export default UploadDataset;
