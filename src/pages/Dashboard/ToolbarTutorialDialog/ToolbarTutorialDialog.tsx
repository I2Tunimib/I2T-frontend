import styled from "@emotion/styled";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import {
  FC,
  useState,
  FunctionComponent,
  useCallback,
} from "react";

type ToolbarTutorialDialogProps = DialogProps & {
  open: boolean;
  onClose: () => void;
};

const List = styled.ul({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  listStyle: "disc",
});

const OrderedList = styled.ul({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  listStyle: "decimal",
  paddingLeft: "20px",
});

const ButtonText = styled.span({
  borderRadius: "6px",
  backgroundColor: "#ebebeb",
  padding: "3px 10px",
  margin: "0 6px",
  boxShadow: "inset 0 -2px #ebefff",
});

const IndexButton = styled(Button, { shouldForwardProp: (prop) => prop !== 'active' })(({ active }: { active?: boolean }) => ({
  textTransform: "none",
  justifyContent: "flex-start",
  fontWeight: active ? "bold" : "normal",
  backgroundColor: active ? "rgba(0, 0, 0, 0.04)" : "transparent",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
}));

const IndexContainer = styled(Box)({
  padding: "16px",
  borderRight: "1px solid rgba(0, 0, 0, 0.12)",
  height: "auto",
  minWidth: "250px",
  overflowY: "auto",
}) as typeof Box;

const ContentContainer = styled(Box)({
  padding: "16px",
  height: "auto",
  width: "100%",
  overflow: "auto",
}) as typeof Box;

type Step = {
  label: string;
  Description: FunctionComponent<{ goTo: (step: number) => void }>;
};

const steps: Step[] = [
  {
    label: "Tutorial journey",
    Description: () => (
      <Typography>Select a topic from the index on the left side.</Typography>
    ),
  },
  {
    label: "Uploading or Creating a Dataset",
    Description: () => (
      <Stack gap="10px">
        <Typography component="div">
          Before importing your tabular data, you must either upload your dataset (supported formats: .zip or .rar)
          containing multiple tables or simply create an empty dataset by providing its name.
          <OrderedList>
            <li>
              From the dashboard, click on <ButtonText>+ NEW DATASET</ButtonText>.
            </li>
            <li>
              In the Add dataset Dialog, enter a Dataset name.
            </li>
            <li>
              Upload a compressed dataset or create an empty dataset.
            </li>
            <li>
              Click <ButtonText>Confirm</ButtonText> to initialize the dataset.
            </li>
          </OrderedList>
        </Typography>
      </Stack>
    ),
  },
  {
    label: "Uploading a Table",
    Description: () => (
      <Stack gap="10px">
        <Typography component="div">
          Once your dataset is created and within the dataset view, you can import your specific data files (supported formats: .csv or .json):
          <OrderedList>
            <li>
              Click on <ButtonText>+ NEW TABLE</ButtonText>.
            </li>
            <li>
              In the Add table Dialog, select the file from your file system.
            </li>
            <li>
              Optionally, provide a Table name.
            </li>
            <li>
              Click <ButtonText>Confirm</ButtonText> to import the table.
            </li>
          </OrderedList>
        </Typography>
      </Stack>
    ),
  },
  {
    label: "Searching for an Element",
    Description: () => (
      <Stack gap="10px">
        <Typography component="div">
          As your workspace grows, you can quickly locate specific projects using the Search Bar located at the top of the dashboard.
          <List>
            <li>
              <b>Hybrid Results with Labels: </b> The dropdown menu displays both Datasets (folders) and Tables (files).
              To help you distinguish between result types, each item is marked with a specific label on the right (dataset or table).
            </li>
            <li>
              <b> Direct Access: </b> Clicking on a table result will take you directly to its table viewer, bypassing the dataset folder navigation.
            </li>
          </List>
        </Typography>
      </Stack>
    ),
  },
  {
    label: "Managing Permissions",
    Description: () => (
      <Stack gap="10px">
        <Typography component="div">
          SemT-X supports collaborative work through a two-level permission system, allowing you to manage access at the Dataset,
          and Table levels.
          <List>
            <li>
              <b>Datasets: </b> Permissions applied to the entire dataset.
            </li>
            <li>
              <b>Tables: </b> Permissions applied to individual tables within a dataset.
            </li>
          </List>
          Permission intersections across these levels are possible; however, the system always enforces the most restrictive setting.
        </Typography>
        <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
          Understanding Roles
        </Typography>
        <Typography>
          As the Owner, you have full control over access management. You can add users by providing their username or email address
          and assigning them one of the following roles:
          <List>
            <li>
              <b>Viewer: </b> Read-only access.
            </li>
            <li>
              <b>Editor: </b> Read-write access.
            </li>
          </List>
          To ensure data consistency, when an Editor is actively editing a table, other collaborators (including other Editors)
          will have read-only access until the session is closed.
        </Typography>
        <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
          Setting Visibility
        </Typography>
        <Typography>
          To manage permissions, simply click on the <ButtonText>Access</ButtonText> button for the target Dataset or Table. You can choose from the
          following visibility options:
          <List>
            <li>
              <b>Inherit from dataset (Table level only): </b> The default setting, where the table adopts the permissions of its parent dataset.
            </li>
            <li>
              <b>Private: </b> Accessible only by the owner and by explicitly listed users (Viewers or Editors).
            </li>
            <li>
              <b>Public: </b> Accessible by any authenticated user (for tables, this remains subject to dataset-level access).
            </li>
          </List>
        </Typography>
      </Stack>
    ),
  },
  {
    label: "Advanced Viewing Modes",
    Description: () => (
      <Stack gap="10px">
        <Typography component="div">
          SemT-X offers specialized view toggles to inspect your datasets and tables structurally:
          <List>
            <li>
              <b>Datasets: </b> Switch from List view to Raw view inspecting datasets in JSON format. If specific datasets are selected, the view dynamically filters to show only those items; otherwise, all datasets are displayed.
            </li>
            <li>
              <b>Tables: </b> Toggle between List, Raw and Grid view. The last one includes a Schema Graph preview along with the detailed list of columns for each table. Just like the datasets, selecting specific tables filters the output, while leaving everything unselected displays all tables.
            </li>
          </List>
        </Typography>
      </Stack>
    ),
  },
  {
    label: "Reviewing Tables",
    Description: () => (
      <Stack gap="10px">
        <Typography component="div">
          Once your data is uploaded, you can quickly review the status of your tables directly from the dashboard using the quick action buttons located next to each table name (visible on hover):
          <List>
            <li>
              <b>Compliance Report: </b> Opens a window to view the latest compliance check (e.g., GDPR).
            </li>
            <li>
              <b> Schema Graph: </b> Displays a visual representation of the table schema.
            </li>
            <li>
              <b>Pipeline: </b> Opens the operation control panel. You can inspect these operations either in a sequential
              list or in a tree view, which illustrates the logical dependencies and helps you trace the enrichment workflow.
            </li>
          </List>
        </Typography>
      </Stack>
    ),
  },
];

const TutorialIndex: FC<{
  activeStep: number;
  onStepSelect: (step: number) => void;
}> = ({ activeStep, onStepSelect }) => {
  return (
    <IndexContainer>
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        Tutorial Contents
      </Typography>
      <Stack spacing={1}>
        <IndexButton active={activeStep === 1} onClick={() => onStepSelect(1)}>
          1. Uploading or Creating a Dataset
        </IndexButton>
        <IndexButton active={activeStep === 2} onClick={() => onStepSelect(2)}>
          2. Uploading a Table
        </IndexButton>
        <IndexButton active={activeStep === 3} onClick={() => onStepSelect(3)}>
          3. Searching an Element
        </IndexButton>
        <IndexButton active={activeStep === 4} onClick={() => onStepSelect(4)}>
          4. Managing Permissions
        </IndexButton>
        <IndexButton active={activeStep === 5} onClick={() => onStepSelect(5)}>
          5. Advanced Viewing Modes
        </IndexButton>
        <IndexButton active={activeStep === 6} onClick={() => onStepSelect(6)}>
          6. Reviewing Tables
        </IndexButton>
      </Stack>
    </IndexContainer>
  );
};

const ToolbarTutorialDialog: FC<ToolbarTutorialDialogProps> = ({ open, onClose, ...props }) => {
  const [start, setStart] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      setStart(false);
      onClose();
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(1, prev - 1));
  };

  const handleStepSelect = useCallback((step: number) => {
    setActiveStep(step);
  }, []);

  const { label, Description } = steps[activeStep];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth {...props}>
      <Box>
        {!start ? (
          <>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
              Dashboard
            </DialogTitle>
            <DialogContent>
              <Stack gap="10px">
                Explore the main dashboard interface to easily navigate through datasets and tables, search for specific element,
                and manage permissions.
                <Stack alignSelf="center" direction="row" gap="16px" marginTop="16px">
                  <Button onClick={() => setStart(true)} variant="outlined">
                    Start tutorial
                  </Button>
                </Stack>
              </Stack>
            </DialogContent>
          </>
        ) : (
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ display: "flex", flexDirection: "column", height: "500px" }}>
              <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
                <TutorialIndex activeStep={activeStep} onStepSelect={handleStepSelect} />
                <ContentContainer>
                  <Typography variant="h6" mb={2}>{label}</Typography>
                  <Description goTo={handleStepSelect} />
                </ContentContainer>
              </Box>
              <Box sx={{ borderTop: "1px solid rgba(0, 0, 0, 0.12)", p: 2, display: "flex", justifyContent: "space-between" }}>
                <Button size="small" onClick={handleBack}>
                  <KeyboardArrowLeft />
                  Back
                </Button>
                <Button size="small" onClick={handleNext}>
                  {activeStep === steps.length - 1 ? "Done"
                    : <>
                      Next
                      <KeyboardArrowRight />
                    </>}
                </Button>
              </Box>
            </Box>
          </DialogContent>
        )}
      </Box>
    </Dialog>
  );
};

export default ToolbarTutorialDialog;
