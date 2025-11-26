import styled from "@emotion/styled";
import { useAppDispatch, useAppSelector } from "@hooks/store";
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
import { setHelpStart } from "@store/slices/table/table.slice";
import { selectTutorialStep, selectDiscoverRecStep, selectDiscoverExtStep } from "@store/slices/table/table.selectors";
import SettingsEthernetRoundedIcon from "@mui/icons-material/SettingsEthernetRounded";
import PlaylistAddCheckRoundedIcon from "@mui/icons-material/PlaylistAddCheckRounded";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import {
  FC,
  useState,
  useRef,
  useCallback,
  FunctionComponent,
  ReactNode,
  useEffect,
} from "react";
import { StatusBadge } from "@components/core";
import DiscoverRecStepper from "./DiscoverRecStepper";
import DiscoverExtStepper from "./DiscoverExtStepper";
import manualAnnotation from "../../../assets/manual-reconciliation.gif";
import automaticAnnotation from "../../../assets/automatic-annotation.gif";
import refineMatchingManual from "../../../assets/refine-matching-manual.gif";
import refineMatchingAutomatic from "../../../assets/refine-matching-automatic.gif";
import extension from "../../../assets/extension.gif";
import search from "../../../assets/search.gif";
import globalActions from "../../../assets/global-actions.png";
import contextualActions from "../../../assets/contextual-actions.png";
import columnHeader from "../../../assets/column-header.png";

type HelpDialogProps = DialogProps;

const List = styled.ul({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  listStyle: "disc",
});

const Img = styled.img({
  width: "100%",
  height: "100%",
  objectFit: "contain",
  borderRadius: "7px",
  maxHeight: "400px",
});

const ButtonText = styled.span({
  borderRadius: "6px",
  backgroundColor: "#ebebeb",
  padding: "3px 10px",
  margin: "0 6px",
  boxShadow: "inset 0 -2px #ebefff",
});

const IndexButton = styled(Button, { shouldForwardProp: (prop) =>
    prop !== 'active' })(({ active }: { active?: boolean }) => ({
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
    label: "Introduction",
    Description: () => (
      <Stack gap="10px">
        <Typography>
          SemTUI is a framework that makes tabular data more informative by
          integrating it with external knowledge sources. It provides an
          intuitive interface to explore tables, manage annotations, and
          enrich data with additional context.
          <br />
          <br />
          In this tutorial, you will learn how to use the
          <b> Table Viewer and its main features</b>
          , as well as how the
          <b> enrichment process </b>
          works — from reconciling data with external datasets to extending it with new information.
        </Typography>
      </Stack>
    ),
  },
  {
    label: "Table Viewer: Global Actions",
    Description: () => (
      <Stack>
        <Typography>
          It is the main component of SemTUI. It allows users to efficiently
          visualize a table and perform various kinds of action on it.
          <Box display="flex" justifyContent="center" my={1}>
            <Img src={globalActions} style={{ width: "90%" }} />
          </Box>
          Starting from the top, the Toolbar contains
          <b> global actions </b>
          that affect the entire
          table. From here, users can:
          <List>
            <li>
              <b>Switch </b>
              between different table views: tabular, raw JSON and graph, still under development.
            </li>
            <li>
              Run an
              <b> automatic annotation </b>
              for the whole table.
            </li>
            <li>
              <b>Export </b>
              the table in different formats: JSON, CSV, Python pipeline and Jupyter notebook pipeline.
            </li>
            <li>
              <b>Save changes </b>
              to the server.
            </li>
            <li>
              Open the
              <b> settings </b>
              panel.
            </li>
            <li>
              Access this
              <b> tutorial</b>
              .
            </li>
          </List>
        </Typography>
      </Stack>
    ),
  },
  {
    label: "Contextual Actions",
    Description: () => (
      <Stack>
        <Typography>
          They are part of the SubToolbar and are enabled when one or
          more table elements (cells, columns, or rows) are selected. They apply only
          to what is selected and may require specific conditions.
          <Box display="flex" justifyContent="center" my={1}>
            <Img src={contextualActions} style={{ width: "70%" }} />
          </Box>
          The main options are:
          <List>
            <li>
              <b>Delete column(s): </b>
              remove the selected column(s).
            </li>
            <li>
              <b>Manage metadata: </b>
              view or edit metadata of the selected column or cells.
            </li>
            <li>
              <b>Expand cell: </b>
              open a detailed view with reconciled data and linked information.
            </li>
            <li>
              <b>Expand header: </b>
              show relationships between reconciled entities in the column header.
            </li>
            <li>
              <b>Toggle dense/accessible view: </b>
              switch the display style of selected columns to improve
              readability.
            </li>
            <li>
              <b>Modify column(s): </b>
              apply transformation functions to the selected column(s), such as date formatting.
            </li>
            <li>
              <b>Reconciliation, Refinement and Extension: </b>
              part of the enrichment process, covered later in this tutorial.
            </li>
          </List>
        </Typography>
      </Stack>
    ),
  },
  {
    label: "Search and Navigation",
    Description: () => (
      <Stack gap="10px">
        <Typography>
          A search and filtering feature is available at the top-right corner.
          <br />
          It enables row filtering based on cell
          <b> labels</b>
          ,
          {" "}
          <b> metadata names</b>
          , and
          <b> types</b>
          .
          <br />
          The search bar provides suggestions while typing, making it faster to locate
          specific entities or annotations. Cells that match the search criteria
          are highlighted, while rows without matches are hidden from the table view.
        </Typography>
        <Img src={search} />
      </Stack>
    ),
  },
  {
    label: "Filtering and Column Visibility",
    Description: () => (
      <Stack gap="10px">
        <Typography>
          Filtering options allow users to focus on specific subsets of data based on their match status
          using the
          <FilterAltOutlinedIcon
            sx={{
              margin: "0px 3px",
              verticalAlign: "middle",
            }}
          />
          icon:
        </Typography>
        <Stack gap="10px">
          <Stack direction="row">
            <StatusBadge
              sx={{
                marginTop: "6px",
                marginRight: "16px",
              }}
              status="match-reconciliator"
            />
            <Typography>
              <b>Matches: </b>
              cells that have been successfully reconciled.
            </Typography>
          </Stack>
          <Stack direction="row">
            <StatusBadge
              sx={{
                marginTop: "6px",
                marginRight: "16px",
              }}
              status="warn"
            />
            <Typography>
              <b>Ambiguous: </b>
              cells with multiple possible reconciliation candidates,
              none of which has a perfect score, so the correct reconciliation is unclear.
            </Typography>
          </Stack>
          <Stack direction="row">
            <StatusBadge
              sx={{
                marginTop: "6px",
                marginRight: "16px",
              }}
              status="miss"
            />
            <Typography>
              <b>Miss matches: </b>
              cells that could not be reconciled or have no match.
            </Typography>
          </Stack>
        </Stack>
        <Typography>
          <br />
          Users can also toggle the visibility of columns via a dynamic list, which
          automatically updates when columns are added or removed, using the
          <VisibilityIcon
            sx={{
              margin: "0px 3px",
              verticalAlign: "middle",
            }}
          />
          icon.
        </Typography>
      </Stack>
    ),
  },
  {
    label: "Column Header Actions",
    Description: () => (
      <Stack gap="10px">
        <Typography>
          Each column header provides actions to manage the column efficiently:
        </Typography>
        <List>
          <li>
            <b>Pin/unpin column: </b>
            keep a column fixed on the left while scrolling.
          </li>
          <li>
            <b>Manage metadata: </b>
            view or edit metadata of the column.
          </li>
          <li>
            <b>Drag & drop: </b>
            reorder columns freely by dragging their headers.
          </li>
          <li>
            <b>Resize column: </b>
            drag the edge manually to adjust width. The reset button
            <RestartAltRoundedIcon
              sx={{
                margin: "0px 3px",
                verticalAlign: "middle",
              }}
            />
            appears in the Subtoolbar only after resizing to restore default widths.
          </li>
          <li>
            <b>Sort alphabetically: </b>
            arrange cell values in ascending or descending order.
          </li>
          <li>
            <b>Sort by match score: </b>
            cells with fully reconciled entities appear first, followed by ambiguous or unmatched cells.
          </li>
        </List>
        <Typography>
          Column headers also indicate the
          <b> type </b>
          of data contained, such as Named Entity tag for a reconciled
          entity, and the
          <b> Reconciliation service </b>
          status showing whether the cell was fully, partially, or not reconciled.
        </Typography>
        <Box display="flex" justifyContent="center" my={1}>
          <Img src={columnHeader} style={{ width: "30%" }} />
        </Box>
      </Stack>
    ),
  },
  {
    label: "Enrichment process",
    Description: () => (
      <Stack>
        The enrichment process involves linking entities in the original data to external datasets (e.g., Wikidata, DBpedia) and consists of two main steps:
        <List>
          <li>
            <b>Reconciliation: </b>
            Matching entities in the original data with entities in a target dataset.
          </li>
          <li>
            <b>Extension: </b>
            Retrieving additional information from the target dataset using the reconciled entities.
          </li>
        </List>
        SemTUI supports both steps by providing integrated access to reconciliation and extension services.
      </Stack>
    ),
  },
  {
    label: "Reconciliation",
    Description: () => (
      <Stack>
        SemTUI provides access to manual and automatic entity reconciliation
        services:
        <List>
          <li>
            <b>Manual reconciliation: </b>
            A column or a cell can be reconciled by activating one of the
            reconciliation services available for the selected dataset or knowledge graph.
          </li>
          <li>
            <b>Automatic reconciliation: </b>
            A Semantic Table Interpretation (STI) service can be activated to automatically
            reconcile cells and annotate headers with predicates and types from Wikidata.
          </li>
        </List>
      </Stack>
    ),
  },
  {
    label: "Manual annotation",
    Description: () => (
      <Stack gap="10px">
        <Typography>
          Select a column or some cells to reconcile and click on the
          <ButtonText> Reconcile </ButtonText>
          button in the application toolbar.
          <br />
          Then, choose a reconciliation service from the list.
        </Typography>
        <Img src={manualAnnotation} />
      </Stack>
    ),
  },
  {
    label: "Automatic annotation",
    Description: () => (
      <Stack gap="10px">
        <Typography>
          Activate the automatic annotation service for the entire table by pressing the
          <ButtonText>Automatic annotation</ButtonText>
          button in the top right corner. It is a long-running asynchronous,
          allowing users to continue working on other tables. Once the process
          is completed, a notification will appear as a pop-up in the bottom left.
        </Typography>
        <Img src={automaticAnnotation} />
      </Stack>
    ),
  },
  {
    label: "Annotation symbols",
    Description: () => (
      <Stack gap="10px">
        <Typography>
          The colors and shapes of the icons in front of reconciled entities provide
          visual feedback on the outcome of the reconciliation process.
        </Typography>
        <Stack gap="10px">
          <Stack direction="row">
            <StatusBadge
              sx={{
                marginTop: "6px",
                marginRight: "16px",
              }}
              status="match-reconciliator"
            />
            <Typography>
              <b>Successful reconciliation:</b>
              The cell is annotated with an entity automatically assigned by the
              <i> reconciliation service</i>
              .
            </Typography>
          </Stack>
          <Stack direction="row">
            <StatusBadge
              sx={{
                marginTop: "6px",
                marginRight: "20px",
              }}
              status="match-refinement"
            />
            <Typography>
              <b>Successful reconciliation: </b>
              An entity has been assigned by the
              <i> column refinement feature</i>
              .
            </Typography>
          </Stack>
          <Stack direction="row">
            <StatusBadge
              sx={{
                marginTop: "6px",
                marginRight: "16px",
              }}
              status="match-manual"
            />
            <Typography>
              <b>Successful reconciliation: </b>
              An entity has been
              <i> manually </i>
              assigned to the cell.
            </Typography>
          </Stack>
          <Stack direction="row">
            <StatusBadge
              sx={{
                marginTop: "6px",
                marginRight: "16px",
              }}
              status="warn"
            />
            <Typography>
              <b>Uncertain reconciliation: </b>
              There are candidate entities above the threshold, but none have been
              selected for the cell because multiple candidates have similar scores.
            </Typography>
          </Stack>
          <Stack direction="row">
            <StatusBadge
              sx={{
                marginTop: "6px",
                marginRight: "16px",
              }}
              status="miss"
            />
            <Typography>
              <b>Unsuccessful reconciliation: </b>
              No candidate entities have been found, or none have scores above the threshold.
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    ),
  },
  {
    label: "Matching Refinement",
    Description: () => (
      <Stack>
        SemTUI supports two types of matching refinement:
        <List>
          <li>
            <b>Single cell refinement: </b>
            The user can assign the
            <i> true </i>
            tag to one of the candidate entities
            for a single cell and optionally propagate the choice to identical cells in the same column.
          </li>
          <li>
            <b>Group of cells refinement: </b>
            The user can select a column (or multiple cells within it) and
            refine the matching using the
            <i> Refine Matching </i>
            feature.
          </li>
        </List>
      </Stack>
    ),
  },
  {
    label: "Single cell Refinement",
    Description: () => (
      <Stack gap="10px">
        <Typography>
          After the reconciliation process is complete, matchings can be refined by inspecting the metadata
          associated with each cell. Use the
          <SettingsEthernetRoundedIcon
            sx={{
              margin: "0px 3px",
              verticalAlign: "middle",
            }}
          />
          icon to view the metadata of a selected cell. Users can click on candidate names to view their
          corresponding entities and browse the associated types to select the correct match.
        </Typography>
        <Img src={refineMatchingManual} />
      </Stack>
    ),
  },
  {
    label: "Group of cells Refinement",
    Description: () => (
      <Stack gap="10px">
        <Typography>
          The
          <PlaylistAddCheckRoundedIcon
            sx={{
              margin: "0px 3px",
              verticalAlign: "middle",
            }}
        />
          icon provides access to the refinement options for a group of cells.
          First, select a column or a subset of its cells. Then, refine either by:
          <List>
            <li>
              Type, choosing from the types associated with the selected cells -
              <b> Type refine matching</b>
            </li>
            <li>
              Applying a score threshold -
              <b> Score refine matching</b>
            </li>
          </List>
        </Typography>
        <Img src={refineMatchingAutomatic} />
      </Stack>
    ),
  },
  {
    label: "Extension",
    Description: () => (
      <Stack gap="10px">
        <Typography>
          Once a column has been reconciled, its matched entities can be used to extend the table.
          Simply select the column, click the
          <ButtonText>Extend</ButtonText>
          button in the toolbar, and then choose one of the available extension services.
        </Typography>
        <Img src={extension} />
      </Stack>
    ),
  },
  {
    label: "",
    Description: () => (
      <Stack
        sx={{
          height: "200px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h4">Tutorial completed!</Typography>
        <Typography>
          These are the core steps to start working with SemTUI.
          <br />
          Explore further to make the most of its features.
        </Typography>
      </Stack>
    ),
  },
];

// Tutorial Index component to display all tutorial sections
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
          1. Introduction
        </IndexButton>
        <IndexButton active={activeStep === 2} onClick={() => onStepSelect(2)}>
          2. Table Viewer: Global Actions
        </IndexButton>
        <IndexButton active={activeStep === 3} onClick={() => onStepSelect(3)} sx={{ pl: 3 }}>
          2.1 Contextual Actions
        </IndexButton>
        <IndexButton active={activeStep === 4} onClick={() => onStepSelect(4)} sx={{ pl: 3 }}>
          2.2 Search and Navigation
        </IndexButton>
        <IndexButton active={activeStep === 5} onClick={() => onStepSelect(5)} sx={{ pl: 3 }}>
          2.3 Filter and Column Visibility
        </IndexButton>
        <IndexButton active={activeStep === 6} onClick={() => onStepSelect(6)} sx={{ pl: 3 }}>
          2.4 Column Header Actions
        </IndexButton>
        <IndexButton active={activeStep === 7} onClick={() => onStepSelect(7)}>
          3. Enrichment Process
        </IndexButton>
        <IndexButton active={activeStep === 8} onClick={() => onStepSelect(8)}>
          4. Reconciliation
        </IndexButton>
        <IndexButton active={activeStep === 9} onClick={() => onStepSelect(9)} sx={{ pl: 3 }}>
          4.1 Manual Annotation
        </IndexButton>
        <IndexButton active={activeStep === 10} onClick={() => onStepSelect(10)} sx={{ pl: 3 }}>
          4.2 Automatic Annotation
        </IndexButton>
        <IndexButton active={activeStep === 11} onClick={() => onStepSelect(11)} sx={{ pl: 3 }}>
          4.3 Annotation Symbols
        </IndexButton>
        <IndexButton active={activeStep === 12} onClick={() => onStepSelect(12)}>
          5. Matching Refinement
        </IndexButton>
        <IndexButton active={activeStep === 13} onClick={() => onStepSelect(13)} sx={{ pl: 3 }}>
          5.1 Single cell Refinement
        </IndexButton>
        <IndexButton active={activeStep === 14} onClick={() => onStepSelect(14)} sx={{ pl: 3 }}>
          5.2 Group of cells Refinement
        </IndexButton>
        <IndexButton active={activeStep === 15} onClick={() => onStepSelect(15)}>
          6. Extension
        </IndexButton>
      </Stack>
    </IndexContainer>
  );
};

type TutorialStepProps = {
  label: string;
  Description: ReactNode;
};

const TutorialStep: FC<TutorialStepProps> = ({ label, Description }) => {
  return (
    <ContentContainer>
      <Typography variant="h6" mb={2}>
        {label}
      </Typography>
      <Box>{Description}</Box>
    </ContentContainer>
  );
};

type TutorialStepperProps = {
  onDone: () => void;
  onBackToWelcome: () => void;
};

const TutorialStepper: FC<TutorialStepperProps> = ({ onDone, onBackToWelcome }) => {
  const tutorialStep = useAppSelector(selectTutorialStep);
  const [activeStep, setActiveStep] = useState(tutorialStep);

  useEffect(() => {
    // Set the active step from Redux when it changes
    if (tutorialStep > 0 && tutorialStep < steps.length) {
      setActiveStep(tutorialStep);
    }
  }, [tutorialStep]);

  const maxSteps = steps.length;

  const handleNext = () => {
    if (activeStep === maxSteps - 1) {
      onDone();
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    if (activeStep === 1) {
      onBackToWelcome();
    } else {
      setActiveStep((prevActiveStep) => Math.max(1, prevActiveStep - 1));
    }
  };

  const handleStepSelect = useCallback((step: number) => {
    setActiveStep(step);
  }, []);

  const { label, Description } = steps[activeStep];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "600px" }}>
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        <TutorialIndex
          activeStep={activeStep}
          onStepSelect={handleStepSelect}
        />
        <TutorialStep
          label={label}
          Description={<Description goTo={handleStepSelect} />}
        />
      </Box>
      <Box
        sx={{
          borderTop: "1px solid rgba(0, 0, 0, 0.12)",
          p: 2,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button size="small" onClick={handleBack}>
          <KeyboardArrowLeft />
          Back
        </Button>
        <Button size="small" onClick={handleNext}>
          {activeStep === maxSteps - 1 ? (
            "Done"
          ) : (
            <>
              Next
              <KeyboardArrowRight />
            </>
          )}
        </Button>
      </Box>
    </Box>
  );
};

const HelpDialog: FC<HelpDialogProps> = ({ onClose, ...props }) => {
  const start = useAppSelector((state) => state.table.ui.helpStart);
  const refWrapper = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const tutorialStep = useAppSelector(selectTutorialStep);
  const discoverRecStep = useAppSelector(selectDiscoverRecStep);
  const discoverExtStep = useAppSelector(selectDiscoverExtStep);

  const handleStart = (value: boolean | "tutorial" | "rec" | "ext") => {
    dispatch(setHelpStart(value));
  };

  useEffect(() => {
    // If a specific tutorial step is set (greater than 1),
    // automatically start the tutorial
    if (tutorialStep && tutorialStep > 1) {
      handleStart("tutorial");
    } else if (discoverRecStep && discoverRecStep > 1) {
      handleStart("rec");
    } else if (discoverExtStep && discoverExtStep > 1) {
      handleStart("ext");
    } else {
      handleStart(false); // welcome
    }
  }, [tutorialStep, discoverRecStep, discoverExtStep, dispatch]);

  const handleOnClose = (
    event: {},
    reason: "backdropClick" | "escapeKeyDown"
  ) => {
    handleStart(false);
    if (onClose) {
      onClose(event, reason);
    }
  };

  const handleOnDone = () => {
    handleStart(false);
  };

  return (
    <Dialog onClose={handleOnClose} maxWidth="md" fullWidth {...props}>
      <Box ref={refWrapper}>
        {!start ? (
          <>
            <DialogTitle
              sx={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              Welcome to SemTUI!
            </DialogTitle>
            <DialogContent>
              <Stack gap="10px">
                SemTUI is a framework for the semantic enrichment of tabular data.
                <br />
                It helps users enhance tables by linking cells and columns to external
                knowledge sources, adding context and extra information.
                <br />
                <Stack alignSelf="center" direction="row" gap="16px" marginTop="16px">
                  <Button
                    onClick={() => handleStart("tutorial")}
                    variant="outlined"
                  >
                    Start tutorial
                  </Button>
                  <Button
                    onClick={() => handleStart("rec")}
                    variant="outlined"
                  >
                    Discover reconcilers
                  </Button>
                  <Button
                    onClick={() => handleStart("ext")}
                    variant="outlined"
                  >
                    Discover extenders
                  </Button>
                </Stack>
              </Stack>
            </DialogContent>
          </>
        ) : (
          <DialogContent sx={{ p: 0 }}>
            {start === "rec" && <DiscoverRecStepper onDone={handleOnDone} onBackToWelcome={() => handleStart(false)} />}
            {start === "ext" && <DiscoverExtStepper onDone={handleOnDone} onBackToWelcome={() => handleStart(false)} />}
            {start === "tutorial" && <TutorialStepper onDone={handleOnDone} onBackToWelcome={() => handleStart(false)} />}
          </DialogContent>
        )}
      </Box>
    </Dialog>
  );
};

export default HelpDialog;

/**
 * To open the help dialog with a specific tutorial section, dispatch the following Redux action:
 *
 * dispatch(updateUI({
 *   openHelpDialog: true,  // Open the dialog
 *   tutorialStep: n        // Show section n (1-10), where 1 is intro and 2-10 are tutorial sections
 * }));
 *
 * If tutorialStep is not specified or is set to 1, the welcome screen will be shown first.
 * If tutorialStep is set to a value from 2-10, the dialog will open directly to that tutorial section.
 */
