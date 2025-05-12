import styled from "@emotion/styled";
import { useAppDispatch } from "@hooks/store";
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
import SettingsEthernetRoundedIcon from "@mui/icons-material/SettingsEthernetRounded";
import PlaylistAddCheckRoundedIcon from "@mui/icons-material/PlaylistAddCheckRounded";
import {
  FC,
  useState,
  useRef,
  useCallback,
  FunctionComponent,
  ReactNode,
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
  width: "550px",
  height: "312px",
  borderRadius: "7px",
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
        The enrichment process is usually composed by two main task:
        <List>
          <li>
            <b>Reconciliation: </b>
            matching entities in the original data to a target dataset (e.g.:
            Wikidata, DBPedia, ...).
          </li>
          <li>
            <b>Extension: </b>
            fetch new information on the target dataset using the reconciliated
            entities to enrich the original data.
          </li>
        </List>
        SemTUI makes these steps easier for you so that you can refine end
        perfect your results of data enrichment.
      </Stack>
    ),
  },
  {
    label: "Reconciliation",
    Description: () => (
      <Stack>
        SemTUI offers two ways to reconcile entities within your table:
        <List>
          <li>
            <b>Manual reconciliation: </b>
            by selecting cells or columns and then using the different
            reconciliation services available.
          </li>
          <li>
            <b>Automatic reconciliation: </b>
            automatically annotate (reconcile cells and associate headers with
            predicates and types) the entire table with one click.
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
          Select one or more cell to reconcile and click on the
          <ButtonText>Reconcile</ButtonText>
          button in the application toolbar. Multiple services are available for
          you to choose from.
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
          You can also choose to automatically annotate the whole table by
          pressing the
          <ButtonText>Automatic annotation</ButtonText>
          button in the top right corner. The process might take a while, but
          you are free to work on other tables. When the annotation process is
          done a notification will popup for you.
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
          To help you understand the result of an annotation process some
          symbols will appear within annotated cells.
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
              : The cell is annotated, but the service did not successfully
              assign any metadata to it, or associated metadata have a score
              lower than the configured lower bound threshold.
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
              : The cell is annotated, but it does not have a matching metadata
              yet.
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
              : The cell is annotated and the matching metadata has been
              assigned manually by the user.
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
              : The cell is annotated and the matching metadata has been
              assigned by the refinement feature.
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
              : The cell is annotated and the matching metadata has been
              assigned automatically by the reconciliator service.
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
          In the top right you can find a search and filtering functionality. It
          provides rows filtering based on cell
          <b> labels </b>
          and
          <b> metadata names </b>
          and
          <b> types</b>. Cells matching the search filter are highlighted
          leaving rows without matches outside of the table visualization.
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
          Once the reconciliation process is done you will be able to refine
          your matchings by inspecting metadata for each cell. You can click on
          the
          <SettingsEthernetRoundedIcon
            sx={{
              margin: "0px 3px",
              verticalAlign: "middle",
            }}
          />
          to inspect metadata of a selected cell.
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
          You can also choose to refine the matching of a group of cells by (i)
          selecting a column or some cells of a column and (ii) select types
          among the ones associated with the selected cells (&quot;Type refine
          matching&quot;), or set a threshold for the scores (&quot;Score refine
          matching&quot;). You can click on the
          <PlaylistAddCheckRoundedIcon
            sx={{
              margin: "0px 3px",
              verticalAlign: "middle",
            }}
          />
          to access this functionality.
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
          Finally, once you have one or more column reconciliated you will be
          able to extend those by clicking the
          <ButtonText>Extend</ButtonText>
          button in the toolbar and choosing one of the available extension
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
        <Typography variant="h4">You are done!</Typography>
        <Typography>Those are the basics to work with SemTUI.</Typography>
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
  const [activeStep, setActiveStep] = useState(1); // Start with introduction step

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
