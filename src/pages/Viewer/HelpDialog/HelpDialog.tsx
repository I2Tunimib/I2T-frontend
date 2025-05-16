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
import { updateUI } from "@store/slices/table/table.slice";
import { selectTutorialStep } from "@store/slices/table/table.selectors";
import SettingsEthernetRoundedIcon from "@mui/icons-material/SettingsEthernetRounded";
import PlaylistAddCheckRoundedIcon from "@mui/icons-material/PlaylistAddCheckRounded";
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
import manualAnnotation from "../../../assets/manual-reconciliation.gif";
import automaticAnnotation from "../../../assets/automatic-annotation.gif";
import refineMatchingManual from "../../../assets/refine-matching-manual.gif";
import refineMatchingAutomatic from "../../../assets/refine-matching-automatic.gif";
import extension from "../../../assets/extension.gif";
import search from "../../../assets/search.gif";

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
  backgroundColor: "#f6f6f6",
  padding: "3px 4px",
  margin: "0 2px",
  boxShadow: "inset 0 -2px #ebefff",
});

const IndexButton = styled(Button)(({ active }: { active?: boolean }) => ({
  textTransform: "none",
  justifyContent: "flex-start",
  fontWeight: active ? "bold" : "normal",
  backgroundColor: active ? "rgba(0, 0, 0, 0.04)" : "transparent",
  "&:hover": {
    backgroundColor: active ? "rgba(0, 0, 0, 0.08)" : "rgba(0, 0, 0, 0.04)",
  },
}));

const IndexContainer = styled(Box)({
  padding: "16px",
  borderRight: "1px solid rgba(0, 0, 0, 0.12)",
  height: "100%",
  minWidth: "250px",
});

const ContentContainer = styled(Box)({
  padding: "16px",
  height: "100%",
  width: "100%",
  overflow: "auto",
});

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
    label: "The enrichment process",
    Description: () => (
      <Stack>
        The enrichment process, which involves matching entities in the original
        data to a target dataset (e.g., Wikidata, DBpedia, etc.), is composed of
        two main tasks:
        <List>
          <li>
            <b>Reconciliation: </b>
            matching entities in the original data to a target dataset (e.g.:
            Wikidata, DBPedia, ...).
          </li>
          <li>
            <b>Extension: </b>
            fetch new information on the target dataset using the reconciled
            entities as matching keys.
          </li>
        </List>
        SemTUI addresses these steps by giving seamless access to reconciliation
        and extension services.
      </Stack>
    ),
  },
  {
    label: "Reconciliation",
    Description: () => (
      <Stack>
        SemTUI offers access to manual and automatic entity reconciliation
        services:
        <List>
          <li>
            <b>Manual reconciliation: </b>a semantic table interpretation (STI)
            service can be activated to automatically reconcile cells and
            annotate headers with predicates and types from Wikidata.
          </li>
          <li>
            <b>Automatic reconciliation: </b>A semantic table interpretation
            (STI) service can be activated to automatically reconcile cells and
            annotate headers with predicates and types to Wikidata.
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
          <ButtonText>Reconcile</ButtonText>
          button in the application toolbar. Choose a reconciliation service
          from the list.
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
          Activate the automatic annotation service for the whole table by
          pressing the
          <ButtonText>Automatic annotation</ButtonText>
          button in the top right corner. The annotation process is a
          long-running asynchronous process that allows users to work on other
          tables. When the annotation process is completed, a notification will
          pop up.
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
          Colors and shapes of icons in front of reconciled entities provide
          visual feedback on the reconciliation process result.
        </Typography>
        <Stack gap="10px">
          <Stack direction="row">
            <StatusBadge
              sx={{
                marginTop: "6px",
                marginRight: "6px",
              }}
              status="miss"
            />
            <Typography>
              Unsuccessful reconciliation: No candidate entities have been
              found, or none have scores above the threshold.
            </Typography>
          </Stack>
          <Stack direction="row">
            <StatusBadge
              sx={{
                marginTop: "6px",
                marginRight: "6px",
              }}
              status="warn"
            />
            <Typography>
              Uncertain reconciliation: There are candidate entities above the
              threshold, but none have been selected for the cell due to
              uncertainty.
            </Typography>
          </Stack>
          <Stack direction="row">
            <StatusBadge
              sx={{
                marginTop: "6px",
                marginRight: "6px",
              }}
              status="match-manual"
            />
            <Typography>
              Successful reconciliation: An entity has been manually assigned to
              the cell.
            </Typography>
          </Stack>
          <Stack direction="row">
            <StatusBadge
              sx={{
                marginTop: "6px",
                marginRight: "6px",
              }}
              status="match-refinement"
            />
            <Typography>
              Successful reconciliation: An entity has been assigned by the
              column refinement feature.
            </Typography>
          </Stack>
          <Stack direction="row">
            <StatusBadge
              sx={{
                marginTop: "6px",
                marginRight: "6px",
              }}
              status="match-reconciliator"
            />
            <Typography>
              Successful reconciliation: The cell is annotated with an entity
              automatically assigned by the reconciliation service.
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    ),
  },
  {
    label: "Table search and navigation",
    Description: () => (
      <Stack gap="10px">
        <Typography>
          A search and filtering feature is available at the top right.
          <br />
          It enables row filtering based on cell <b>labels</b>,{" "}
          <b>metadata names</b>, and <b>types</b>. <br />
          Cells matching the search criteria are highlighted, and rows without
          matches are excluded from the table view.
        </Typography>
        <Img src={search} />
      </Stack>
    ),
  },
  {
    label: "Refine matching (1) - single cell",
    Description: () => (
      <Stack gap="10px">
        <Typography>
          After the reconciliation process is complete, matchings can be refined
          by inspecting the metadata associated with each cell. The
          <SettingsEthernetRoundedIcon
            sx={{
              margin: "0px 3px",
              verticalAlign: "middle",
            }}
          />
          icon can be used to inspect the metadata of a selected cell.
        </Typography>
        <Img src={refineMatchingManual} />
      </Stack>
    ),
  },
  {
    label: "Refine matching (2) - group of cells",
    Description: () => (
      <Stack gap="10px">
        <Typography>
          The matching of a group of cells can also be refined by (i) selecting
          a column or a subset of its cells, and (ii) choosing types from those
          associated with the selected cells (<q>Type refine matching</q>), or
          by setting a threshold for the scores (<q>Score refine matching</q>).
          The
          <PlaylistAddCheckRoundedIcon
            sx={{
              margin: "0px 3px",
              verticalAlign: "middle",
            }}
          />
          icon provides access to this functionality.
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
          Once one or more columns have been reconciled, they can be extended by
          clicking the
          <ButtonText>Extend</ButtonText>
          button in the toolbar and selecting one of the available extension
          services.
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
          These are the core steps to start working with SemTUI. <br />
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
          2. Reconciliation
        </IndexButton>
        <IndexButton
          active={activeStep === 3}
          onClick={() => onStepSelect(3)}
          sx={{ pl: 3 }}
        >
          2.1 Manual Annotation
        </IndexButton>
        <IndexButton
          active={activeStep === 4}
          onClick={() => onStepSelect(4)}
          sx={{ pl: 3 }}
        >
          2.2 Automatic Annotation
        </IndexButton>
        <IndexButton
          active={activeStep === 5}
          onClick={() => onStepSelect(5)}
          sx={{ pl: 3 }}
        >
          2.3 Annotation Symbols
        </IndexButton>
        <IndexButton active={activeStep === 6} onClick={() => onStepSelect(6)}>
          3. Table Search and Navigation
        </IndexButton>
        <IndexButton
          active={activeStep === 7 || activeStep === 8}
          onClick={() => onStepSelect(7)}
        >
          4. Matching Refinement
        </IndexButton>
        <IndexButton active={activeStep === 9} onClick={() => onStepSelect(9)}>
          5. Extension
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
};

const TutorialStepper: FC<TutorialStepperProps> = ({ onDone }) => {
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
    setActiveStep((prevActiveStep) => Math.max(1, prevActiveStep - 1));
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
        <Button size="small" onClick={handleBack} disabled={activeStep <= 1}>
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
  const [start, setStart] = useState(false);
  const refWrapper = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const tutorialStep = useAppSelector(selectTutorialStep);

  useEffect(() => {
    // If a specific tutorial step is set (greater than 1),
    // automatically start the tutorial
    if (tutorialStep > 1) {
      setStart(true);
    }
  }, [tutorialStep]);

  const handleOnClose = (
    event: {},
    reason: "backdropClick" | "escapeKeyDown"
  ) => {
    setStart(false);
    if (onClose) {
      onClose(event, reason);
    }
  };

  const handleOnDone = () => {
    setStart(false);
    dispatch(updateUI({ openHelpDialog: false }));
  };

  return (
    <Dialog onClose={handleOnClose} maxWidth="lg" fullWidth {...props}>
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
                SemTUI is a framework for semantic enrichment of tabular data.
                The enrichment task is the process of augmenting or extending
                some data with additional data from different external sources.
                <br />
                SemTUI tries to make the steps to enrich a table easier and
                affordable even to less experienced users.
                <Button
                  onClick={() => setStart(true)}
                  sx={{
                    alignSelf: "center",
                  }}
                >
                  Start tutorial
                </Button>
              </Stack>
            </DialogContent>
          </>
        ) : (
          <DialogContent sx={{ p: 0, overflow: "hidden" }}>
            <TutorialStepper onDone={handleOnDone} />
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
